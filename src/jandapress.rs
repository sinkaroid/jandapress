use crate::cache::CacheManager;
use crate::config::Config;
use crate::error::AppError;
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, USER_AGENT};
use serde_json::Value;
use std::time::Duration;
use tracing::info;

use crate::middleware::RateLimitState;

#[derive(Clone)]
pub struct JandaPress {
    pub client: reqwest::Client,
    pub cache: CacheManager,
    pub nhentai_api_key: Option<String>,
    pub user_agent: String,
    pub rate_limit: RateLimitState,
}

impl JandaPress {
    pub fn new(config: &Config) -> Self {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(15))
            .danger_accept_invalid_certs(true)
            .build()
            .unwrap_or_default();

        let cache = CacheManager::new(config.redis_url.as_deref(), config.expire_cache);
        let rate_limit = RateLimitState::new();

        Self {
            client,
            cache,
            nhentai_api_key: config.nhentai_api_key.clone(),
            user_agent: config.user_agent.clone(),
            rate_limit,
        }
    }

    pub fn nhentai_headers(&self) -> HeaderMap {
        let mut headers = HeaderMap::new();
        headers.insert(
            USER_AGENT,
            HeaderValue::from_str(&self.user_agent).unwrap_or_else(|_| HeaderValue::from_static("")),
        );

        if let Some(key) = &self.nhentai_api_key {
            let key = key.trim();
            if !key.is_empty() {
                if let Ok(val) = HeaderValue::from_str(&format!("Bearer {}", key)) {
                    headers.insert(AUTHORIZATION, val);
                }
            }
        }

        headers
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
        // Read RSS using sysinfo
        let mut sys = sysinfo::System::new();
        sys.refresh_processes(sysinfo::ProcessesToUpdate::All, false);

        let pid = sysinfo::Pid::from(std::process::id() as usize);
        let (rss_mb, heap_mb) = if let Some(process) = sys.process(pid) {
            let mem_bytes = process.memory(); // in bytes
            let rss = mem_bytes as f64 / 1024.0 / 1024.0;
            // Since Rust uses standard allocator directly without custom VM heap structures,
            // we'll report virtual memory or represent heapUsed as a proxy (e.g. 70% of RSS).
            let virt = process.virtual_memory() as f64 / 1024.0 / 1024.0;
            (rss, virt)
        } else {
            (0.0, 0.0)
        };

        (
            format!("{:.2} MB", rss_mb),
            format!("{:.2}/{:.2} MB", rss_mb * 0.7, heap_mb),
        )
    }

    pub async fn get_server_location(&self) -> String {
        // Run a lightweight geoloc lookup (using ipwho.is as in legacy)
        // With a short timeout (3 seconds)
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(3))
            .build()
            .unwrap_or_default();

        match client.get("https://ipwho.is/").send().await {
            Ok(res) => {
                if res.status().is_success() {
                    if let Ok(json) = res.json::<Value>().await {
                        if json["success"].as_bool().unwrap_or(false) {
                            let country = json["country"].as_str().unwrap_or("").trim();
                            let region = json["region"].as_str().unwrap_or("").trim();
                            if !country.is_empty() && !region.is_empty() {
                                return format!("{}, {}", country, region);
                            }
                        }
                    }
                }
                "Unknown".to_string()
            }
            Err(_) => "Unknown".to_string(),
        }
    }
}
