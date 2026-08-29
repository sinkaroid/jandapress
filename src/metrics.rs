use axum::{http::header::USER_AGENT, response::IntoResponse};
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

// Global metric states
pub static METRICS_START_TIME: AtomicU64 = AtomicU64::new(0);
pub static METRICS_RSS: AtomicU64 = AtomicU64::new(0);
pub static METRICS_LAG: AtomicU64 = AtomicU64::new(0); // represented as micro-seconds
pub static METRICS_CPU_TOTAL: AtomicU64 = AtomicU64::new(0); // represented as micro-seconds
pub static METRICS_IN_FLIGHT: AtomicU64 = AtomicU64::new(0);
pub static METRICS_REQ_TOTAL: AtomicU64 = AtomicU64::new(0);

pub fn init_metrics() {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    METRICS_START_TIME.store(now, Ordering::Relaxed);

    // Spawn a background task to collect system statistics every 15 seconds
    tokio::spawn(async move {
        let mut sys = sysinfo::System::new();
        let pid = sysinfo::Pid::from(std::process::id() as usize);
        let mut last_cpu_total_secs = 0.0;

        loop {
            tokio::time::sleep(Duration::from_secs(15)).await;

            // 1. Event loop lag measurement (scheduler lag)
            let start = Instant::now();
            tokio::spawn(async move {
                let lag = start.elapsed();
                let lag_micros = lag.as_micros() as u64;
                METRICS_LAG.store(lag_micros, Ordering::Relaxed);
            });

            // 2. Memory & CPU Seconds measurement
            sys.refresh_processes(sysinfo::ProcessesToUpdate::All, false);
            if let Some(proc) = sys.process(pid) {
                // RSS bytes
                METRICS_RSS.store(proc.memory(), Ordering::Relaxed);

                // Accumulate CPU usage
                // proc.cpu_usage() returns % of CPU used.
                // Accumulated seconds = (cpu_usage / 100) * 15 seconds (since last loop)
                let cpu_pct = proc.cpu_usage() as f64;
                let cpu_delta = (cpu_pct / 100.0) * 15.0;
                last_cpu_total_secs += cpu_delta;

                let cpu_micros = (last_cpu_total_secs * 1_000_000.0) as u64;
                METRICS_CPU_TOTAL.store(cpu_micros, Ordering::Relaxed);
            }
        }
    });
}

pub async fn metrics_handler() -> impl IntoResponse {
    let rss = METRICS_RSS.load(Ordering::Relaxed);
    let lag_secs = METRICS_LAG.load(Ordering::Relaxed) as f64 / 1_000_000.0;
    let cpu_secs = METRICS_CPU_TOTAL.load(Ordering::Relaxed) as f64 / 1_000_000.0;
    let uptime = METRICS_START_TIME.load(Ordering::Relaxed);
    let in_flight = METRICS_IN_FLIGHT.load(Ordering::Relaxed);
    let req_total = METRICS_REQ_TOTAL.load(Ordering::Relaxed);

    let output = format!(
        r#"# HELP process_resident_set_size_bytes Resident Set Size — total physical RAM used by the process
# TYPE process_resident_set_size_bytes gauge
process_resident_set_size_bytes {}

# HELP eventloop_lag_seconds Event loop lag — delay of the event loop for synchronous blocking detection
# TYPE eventloop_lag_seconds gauge
eventloop_lag_seconds {:.6}

# HELP process_cpu_seconds_total Total user + system CPU time spent (seconds)
# TYPE process_cpu_seconds_total counter
process_cpu_seconds_total {:.6}

# HELP process_start_time_seconds Start time of the process since unix epoch (seconds)
# TYPE process_start_time_seconds gauge
process_start_time_seconds {}

# HELP http_requests_in_flight Number of HTTP requests currently being processed (active)
# TYPE http_requests_in_flight gauge
http_requests_in_flight {}

# HELP http_requests_total Total number of HTTP requests processed
# TYPE http_requests_total counter
http_requests_total {}
"#,
        rss, lag_secs, cpu_secs, uptime, in_flight, req_total
    );

    (
        [("Content-Type", "text/plain; version=0.0.4; charset=utf-8")],
        output,
    )
}

pub async fn telemetry_middleware(
    req: axum::http::Request<axum::body::Body>,
    next: axum::middleware::Next,
) -> impl IntoResponse {
    let method = req.method().clone();
    let path = req.uri().path().to_string();

    let headers = req.headers();
    let ip = headers
        .get("x-forwarded-for")
        .and_then(|h| h.to_str().ok())
        .and_then(|s| s.split(',').next())
        .map(|s| s.trim())
        .or_else(|| headers.get("x-real-ip").and_then(|h| h.to_str().ok()))
        .unwrap_or("unknown")
        .to_string();

    let user_agent = headers
        .get(USER_AGENT)
        .and_then(|h| h.to_str().ok())
        .unwrap_or("unknown")
        .to_string();

    tracing::info!("Incoming request: {} {} | IP: {} | UA: {}", method, path, ip, user_agent);

    METRICS_REQ_TOTAL.fetch_add(1, Ordering::Relaxed);
    METRICS_IN_FLIGHT.fetch_add(1, Ordering::Relaxed);
    let res = next.run(req).await;
    METRICS_IN_FLIGHT.fetch_sub(1, Ordering::Relaxed);
    res
}
