use axum::{
    body::Body,
    extract::State,
    http::{HeaderMap, HeaderValue, Request, StatusCode},
    middleware::Next,
    response::Response,
};
use crate::jandapress::JandaPress;
use dashmap::DashMap;
use serde::Serialize;
use std::{
    sync::Arc,
    time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};
use tokio::time::sleep;

const WINDOW_MS: u128 = 15 * 60 * 1000; // 15 minutes
const LIMIT_MAX: u32 = 50;
const SLOW_DELAY_AFTER: u32 = 50;
const SLOW_DELAY_MS: u64 = 1000;
const SLOW_MAX_DELAY_MS: u64 = 20000;
const BUCKET_MAX_SIZE: usize = 50000;

#[derive(Clone, Debug)]
struct Counter {
    count: u32,
    reset_at: Instant,
    reset_at_sys: SystemTime,
}

#[derive(Clone)]
pub struct RateLimitState {
    buckets: Arc<DashMap<String, Counter>>,
}

#[derive(Serialize)]
struct RateLimitMessage {
    message: String,
}

impl RateLimitState {
    pub fn new() -> Self {
        let buckets = Arc::new(DashMap::new());
        let buckets_clone = Arc::clone(&buckets);

        // Start background cleaner task (runs every 30 seconds)
        tokio::spawn(async move {
            loop {
                sleep(Duration::from_secs(30)).await;
                let now = Instant::now();
                buckets_clone.retain(|_, counter: &mut Counter| counter.reset_at > now);
            }
        });

        Self { buckets }
    }

    fn touch(&self, key: String) -> Counter {
        let now_instant = Instant::now();
        let now_sys = SystemTime::now();

        // Check if there is an existing counter that hasn't expired
        if let Some(mut r) = self.buckets.get_mut(&key) {
            if r.reset_at > now_instant {
                r.count += 1;
                return r.clone();
            }
        }

        // Bounded capacity protection
        if self.buckets.len() >= BUCKET_MAX_SIZE {
            // Sweep expired keys first
            self.buckets.retain(|_, counter| counter.reset_at > now_instant);
        }

        let fresh = Counter {
            count: 1,
            reset_at: now_instant + Duration::from_millis(WINDOW_MS as u64),
            reset_at_sys: now_sys + Duration::from_millis(WINDOW_MS as u64),
        };

        if self.buckets.len() < BUCKET_MAX_SIZE {
            self.buckets.insert(key, fresh.clone());
        }

        fresh
    }
}

fn get_client_ip(headers: &HeaderMap) -> String {
    let trusted_ip_headers = ["cf-connecting-ip", "fly-client-ip", "x-vercel-forwarded-for", "x-client-ip"];
    for header in trusted_ip_headers {
        if let Some(val) = headers.get(header).and_then(|v| v.to_str().ok()) {
            if let Some(first_ip) = val.split(',').next() {
                let cleaned = first_ip.trim();
                if !cleaned.is_empty() {
                    return cleaned.to_string();
                }
            }
        }
    }

    // Fallback checking if allowed proxy headers is set in env
    let allow_untrusted = std::env::var("ALLOW_UNTRUSTED_PROXY_HEADERS")
        .ok()
        .map(|v| v.trim().to_lowercase() == "true")
        .unwrap_or(false);

    if allow_untrusted {
        if let Some(val) = headers.get("x-forwarded-for").and_then(|v| v.to_str().ok()) {
            if let Some(first_ip) = val.split(',').next() {
                return first_ip.trim().to_string();
            }
        }
        if let Some(val) = headers.get("x-real-ip").and_then(|v| v.to_str().ok()) {
            return val.trim().to_string();
        }
    }

    "unknown".to_string()
}

pub async fn slow_down_middleware(
    State(janda): State<JandaPress>,
    req: Request<Body>,
    next: Next,
) -> Result<Response, StatusCode> {
    if req.method() == axum::http::Method::OPTIONS {
        return Ok(next.run(req).await);
    }

    let ip = get_client_ip(req.headers());
    let path = req.uri().path();
    let key = format!("slow:{}:{}", ip, path);

    let state = &janda.rate_limit;
    let bucket = state.touch(key);
    if bucket.count > SLOW_DELAY_AFTER {
        let steps = bucket.count - SLOW_DELAY_AFTER;
        let wait_ms = std::cmp::min(steps as u64 * SLOW_DELAY_MS, SLOW_MAX_DELAY_MS);
        sleep(Duration::from_millis(wait_ms)).await;
    }

    Ok(next.run(req).await)
}

pub async fn rate_limiter_middleware(
    State(janda): State<JandaPress>,
    req: Request<Body>,
    next: Next,
) -> Result<Response, StatusCode> {
    if req.method() == axum::http::Method::OPTIONS {
        return Ok(next.run(req).await);
    }

    let ip = get_client_ip(req.headers());
    let path = req.uri().path();
    let key = format!("limit:{}:{}", ip, path);

    let state = &janda.rate_limit;
    let bucket = state.touch(key);
    let remaining = LIMIT_MAX.saturating_sub(bucket.count);

    let reset_timestamp = bucket
        .reset_at_sys
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    if bucket.count > LIMIT_MAX {
        let now_sys = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        let retry_after_sec = reset_timestamp.saturating_sub(now_sys).max(1);

        let payload = RateLimitMessage {
            message: "Too nasty, please slow down".to_string(),
        };

        let mut res = Response::new(Body::from(serde_json::to_string(&payload).unwrap()));
        *res.status_mut() = StatusCode::TOO_MANY_REQUESTS;
        
        let headers = res.headers_mut();
        headers.insert("Content-Type", HeaderValue::from_static("application/json; charset=UTF-8"));
        headers.insert("X-RateLimit-Limit", HeaderValue::from(LIMIT_MAX));
        headers.insert("X-RateLimit-Remaining", HeaderValue::from(0));
        headers.insert("X-RateLimit-Reset", HeaderValue::from(reset_timestamp));
        headers.insert("Retry-After", HeaderValue::from(retry_after_sec));

        return Ok(res);
    }

    let mut res = next.run(req).await;
    let headers = res.headers_mut();
    headers.insert("X-RateLimit-Limit", HeaderValue::from(LIMIT_MAX));
    headers.insert("X-RateLimit-Remaining", HeaderValue::from(remaining));
    headers.insert("X-RateLimit-Reset", HeaderValue::from(reset_timestamp));

    Ok(res)
}
