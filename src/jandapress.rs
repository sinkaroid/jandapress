use crate::cache::CacheManager;
use crate::config::Config;
use crate::error::AppError;
use reqwest::header::{AUTHORIZATION, HeaderMap, HeaderValue, USER_AGENT};
use serde_json::Value;
use std::sync::atomic::Ordering;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use tracing::info;

use crate::middleware::RateLimitState;

#[derive(Clone)]
pub struct JandaPress {
    pub client: reqwest::Client,
    pub cache: CacheManager,
    #[allow(dead_code)]
    pub nhentai_api_key: Option<String>,
    pub user_agent: String,
    pub rate_limit: RateLimitState,
    pub nhentai_headers: HeaderMap,
    server_location_cache: Arc<RwLock<Option<(Instant, String)>>>,
    simply_hentai_mock_cache: Arc<RwLock<Option<(Instant, bool)>>>,
}

impl JandaPress {
    pub fn new(config: &Config) -> Self {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(15))
            .build()
            .unwrap_or_default();

        let cache = CacheManager::new(config.redis_url.as_deref(), config.expire_cache);
        let rate_limit = RateLimitState::new();

        let mut nhentai_headers = HeaderMap::new();
        nhentai_headers.insert(
            USER_AGENT,
            HeaderValue::from_str(&config.user_agent)
                .unwrap_or_else(|_| HeaderValue::from_static("")),
        );
        let mut auth_type = "none";
        let masked_key = match &config.nhentai_api_key {
            Some(k) if !k.trim().is_empty() => {
                let trimmed = k.trim();
                if let Ok(val) = HeaderValue::from_str(&format!("Key {}", trimmed)) {
                    nhentai_headers.insert(AUTHORIZATION, val);
                    auth_type = "Key";
                }
                let prefix = if trimmed.len() >= 6 { &trimmed[..6] } else { trimmed };
                format!("{}...({})", prefix, trimmed.len())
            }
            _ => "none".to_string(),
        };
        info!(
            "[nhentai] headers ready | apiKey={} | auth={} | ua={}",
            masked_key, auth_type, config.user_agent
        );


        Self {
            client,
            cache,
            nhentai_api_key: config.nhentai_api_key.clone(),
            user_agent: config.user_agent.clone(),
            rate_limit,
            nhentai_headers,
            server_location_cache: Arc::new(RwLock::new(None)),
            simply_hentai_mock_cache: Arc::new(RwLock::new(None)),
        }
    }

    pub fn nhentai_headers(&self) -> HeaderMap {
        self.nhentai_headers.clone()
    }

    pub async fn simulate_nhentai_request(&self, target: &str) -> Result<Value, AppError> {
        let res = self
            .client
            .get(target)
            .headers(self.nhentai_headers())
            .send()
            .await?;

        if !res.status().is_success() {
            return Err(AppError::ScraperError {
                status: res.status(),
                message: format!("Request failed with status {}", res.status()),
            });
        }

        let json = res.json::<Value>().await?;
        Ok(json)
    }

    pub async fn fetch_body(&self, url: &str) -> Result<Vec<u8>, AppError> {
        if let Some(cached) = self.cache.get(url).await {
            info!("Fetching from cache: {}", url);
            return Ok(cached);
        }

        if url.contains("/random") {
            info!("Random should not be cached: {}", url);
            let res = self
                .client
                .get(url)
                .header(USER_AGENT, &self.user_agent)
                .send()
                .await?;

            if !res.status().is_success() {
                return Err(AppError::ScraperError {
                    status: res.status(),
                    message: format!("Request failed with status {}", res.status()),
                });
            }

            let bytes = res.bytes().await?.to_vec();
            return Ok(bytes);
        }

        info!("Fetching from source: {}", url);
        let res = self
            .client
            .get(url)
            .header(USER_AGENT, &self.user_agent)
            .send()
            .await?;

        if !res.status().is_success() {
            return Err(AppError::ScraperError {
                status: res.status(),
                message: format!("Request failed with status {}", res.status()),
            });
        }

        let bytes = res.bytes().await?.to_vec();
        self.cache.set(url, &bytes).await;

        Ok(bytes)
    }

    pub async fn fetch_json(&self, url: &str) -> Result<Value, AppError> {
        if let Some(cached_bytes) = self.cache.get(url).await {
            info!("Fetching from cache: {}", url);
            if let Ok(json) = serde_json::from_slice::<Value>(&cached_bytes) {
                return Ok(json);
            }
        }

        info!("Fetching from source: {}", url);
        let json = self.simulate_nhentai_request(url).await?;
        if let Ok(bytes) = serde_json::to_vec(&json) {
            self.cache.set(url, &bytes).await;
        }

        Ok(json)
    }

    pub fn current_process(&self) -> (String, String) {
        let mem_bytes = crate::metrics::METRICS_RSS.load(Ordering::Relaxed);
        let virt_bytes = crate::metrics::METRICS_VSZ.load(Ordering::Relaxed);

        let rss_mb = mem_bytes as f64 / 1024.0 / 1024.0;
        let virt_mb = virt_bytes as f64 / 1024.0 / 1024.0;

        (
            format!("{:.2} MB", rss_mb),
            format!("{:.2}/{:.2} MB", rss_mb * 0.7, virt_mb),
        )
    }

    pub async fn get_server_location(&self) -> String {
        const LOCATION_TTL: Duration = Duration::from_secs(30 * 60);

        // Fast path: check read lock
        {
            let cache_read = self.server_location_cache.read().await;
            if let Some((timestamp, ref location)) = *cache_read
                && timestamp.elapsed() < LOCATION_TTL
            {
                return location.clone();
            }
        }

        // Slow path: acquire write lock and refresh
        let mut cache_write = self.server_location_cache.write().await;
        if let Some((timestamp, ref location)) = *cache_write
            && timestamp.elapsed() < LOCATION_TTL
        {
            return location.clone();
        }

        let result = match self
            .client
            .get("https://ipwho.is/")
            .timeout(Duration::from_secs(3))
            .send()
            .await
        {
            Ok(res) if res.status().is_success() => {
                if let Ok(json) = res.json::<Value>().await
                    && json["success"].as_bool().unwrap_or(false)
                {
                    let country = json["country"].as_str().unwrap_or("").trim();
                    let region = json["region"].as_str().unwrap_or("").trim();
                    if !country.is_empty() && !region.is_empty() {
                        format!("{}, {}", country, region)
                    } else {
                        "Unknown".to_string()
                    }
                } else {
                    "Unknown".to_string()
                }
            }
            _ => "Unknown".to_string(),
        };

        *cache_write = Some((Instant::now(), result.clone()));
        result
    }

    pub async fn check_simply_hentai_mock(&self, url: &str) -> bool {
        const MOCK_TTL: Duration = Duration::from_secs(10 * 60);

        // Fast path: check read lock
        {
            let cache_read = self.simply_hentai_mock_cache.read().await;
            if let Some((timestamp, is_healthy)) = *cache_read
                && timestamp.elapsed() < MOCK_TTL
            {
                return is_healthy;
            }
        }

        let mut cache_write = self.simply_hentai_mock_cache.write().await;
        if let Some((timestamp, is_healthy)) = *cache_write
            && timestamp.elapsed() < MOCK_TTL
        {
            return is_healthy;
        }

        let is_healthy = match self
            .client
            .get(url)
            .timeout(Duration::from_secs(5))
            .send()
            .await
        {
            Ok(res) => {
                let status = res.status();
                status == axum::http::StatusCode::OK
                    || status == axum::http::StatusCode::PERMANENT_REDIRECT
            }
            Err(_) => false,
        };

        *cache_write = Some((Instant::now(), is_healthy));
        is_healthy
    }
}
