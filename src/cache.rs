use deadpool_redis::{Config as RedisConfig, Pool, Runtime};
use moka::future::Cache as MokaCache;
use std::time::Duration;
use tracing::{info, warn};

#[derive(Clone)]
pub enum CacheBackend {
    InMemory(MokaCache<String, Vec<u8>>),
    Redis(Pool),
}

#[derive(Clone)]
pub struct CacheManager {
    backend: CacheBackend,
    ttl: Duration,
}

fn mask_redis_url(url: &str) -> String {
    if let Some(start_idx) = url.find("://") {
        let scheme = &url[..start_idx + 3];
        let rest = &url[start_idx + 3..];
        if let Some(at_idx) = rest.find('@') {
            let auth_part = &rest[..at_idx];
            let host_part = &rest[at_idx..]; // "@host:port..."
            if let Some(colon_idx) = auth_part.find(':') {
                let username = &auth_part[..colon_idx];
                return format!("{}{}:******{}", scheme, username, host_part);
            } else {
                return format!("{}******{}", scheme, host_part);
            }
        }
    }
    url.to_string()
}

impl CacheManager {
    pub fn new(redis_url: Option<&str>, expire_hours: u64) -> Self {
        let ttl = Duration::from_secs(expire_hours * 3600);

        let backend = if let Some(url) = redis_url {
            info!("Initializing Redis cache backend with url: {}", mask_redis_url(url));
            let mut cfg = RedisConfig::default();
            cfg.url = Some(url.to_string());
            cfg.connection = None;
            match cfg.create_pool(Some(Runtime::Tokio1)) {
                Ok(pool) => CacheBackend::Redis(pool),
                Err(err) => {
                    warn!("Failed to create Redis pool: {:?}. Falling back to In-Memory cache.", err);
                    Self::create_in_memory_backend(ttl)
                }
            }
        } else {
            info!("No Redis URL provided. Initializing bounded In-Memory cache backend.");
            Self::create_in_memory_backend(ttl)
        };

        Self { backend, ttl }
    }

    fn create_in_memory_backend(ttl: Duration) -> CacheBackend {
        // Bounded to 1000 entries max to prevent memory growth leaks
        let cache = MokaCache::builder()
            .max_capacity(1000)
            .time_to_live(ttl)
            .build();
        CacheBackend::InMemory(cache)
    }

    pub async fn test_connection(&self) -> Result<(), String> {
        match &self.backend {
            CacheBackend::InMemory(_) => Ok(()),
            CacheBackend::Redis(pool) => {
                let mut conn = pool.get().await.map_err(|e| format!("Failed to get Redis connection: {:?}", e))?;
                let pong: String = redis::cmd("PING")
                    .query_async(&mut conn)
                    .await
                    .map_err(|e| format!("PING command failed: {:?}", e))?;
                if pong == "PONG" {
                    Ok(())
                } else {
                    Err(format!("Unexpected PING response: {}", pong))
                }
            }
        }
    }

    pub async fn get(&self, key: &str) -> Option<Vec<u8>> {
        match &self.backend {
            CacheBackend::InMemory(cache) => cache.get(key).await,
            CacheBackend::Redis(pool) => {
                let mut conn = match pool.get().await {
                    Ok(c) => c,
                    Err(err) => {
                        warn!("Failed to get Redis connection from pool: {:?}", err);
                        return None;
                    }
                };

                let cmd = redis::cmd("GET").arg(key).query_async::<Option<Vec<u8>>>(&mut conn).await;
                match cmd {
                    Ok(val) => val,
                    Err(err) => {
                        warn!("Redis GET error: {:?}", err);
                        None
                    }
                }
            }
        }
    }

    pub async fn set(&self, key: &str, value: &[u8]) {
        match &self.backend {
            CacheBackend::InMemory(cache) => {
                cache.insert(key.to_string(), value.to_vec()).await;
            }
            CacheBackend::Redis(pool) => {
                let mut conn = match pool.get().await {
                    Ok(c) => c,
                    Err(err) => {
                        warn!("Failed to get Redis connection from pool: {:?}", err);
                        return;
                    }
                };

                // Use SETEX command: SETEX key seconds value
                let ttl_secs = self.ttl.as_secs();
                let cmd = redis::cmd("SETEX")
                    .arg(key)
                    .arg(ttl_secs)
                    .arg(value)
                    .query_async::<()>(&mut conn)
                    .await;
                if let Err(err) = cmd {
                    warn!("Redis SETEX error: {:?}", err);
                }
            }
        }
    }
}
