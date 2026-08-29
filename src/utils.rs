use chrono::{DateTime, Local};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

pub fn is_numeric(val: &str) -> bool {
    val.parse::<f64>().is_ok()
}

pub fn get_date(sys_time: SystemTime) -> String {
    let dt: DateTime<Local> = sys_time.into();
    dt.format("%B %e, %Y").to_string()
}

pub fn time_ago(sys_time: SystemTime) -> String {
    let now = SystemTime::now();
    let elapsed = match now.duration_since(sys_time) {
        Ok(d) => d.as_secs(),
        Err(_) => return "just now".to_string(),
    };

    let years = elapsed / (3600 * 24 * 365);
    if years > 0 {
        return format!("{} year{} ago", years, if years > 1 { "s" } else { "" });
    }

    let months = elapsed / (3600 * 24 * 30);
    if months > 0 {
        return format!("{} month{} ago", months, if months > 1 { "s" } else { "" });
    }

    let weeks = elapsed / (3600 * 24 * 7);
    if weeks > 0 {
        return format!("{} week{} ago", weeks, if weeks > 1 { "s" } else { "" });
    }

    let days = elapsed / (3600 * 24);
    if days > 0 {
        return format!("{} day{} ago", days, if days > 1 { "s" } else { "" });
    }

    let hours = elapsed / 3600;
    if hours > 0 {
        return format!("{} hour{} ago", hours, if hours > 1 { "s" } else { "" });
    }

    let minutes = elapsed / 60;
    if minutes > 0 {
        return format!("{} minute{} ago", minutes, if minutes > 1 { "s" } else { "" });
    }

    format!("{} second{} ago", elapsed, if elapsed != 1 { "s" } else { "" })
}

pub fn format_upload_date(unix_seconds: i64) -> String {
    let d = UNIX_EPOCH + Duration::from_secs(unix_seconds as u64);
    format!("{} ({})", get_date(d), time_ago(d))
}

pub fn remove_non_numeric(input: &str) -> String {
    input.chars().filter(|c| c.is_ascii_digit()).collect()
}
