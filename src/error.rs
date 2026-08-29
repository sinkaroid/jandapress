use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Serialize;
use tracing::error;

#[derive(Debug)]
pub enum AppError {
    // Controller / Scraper level errors (which return {"success": false, "message": "..."})
    ScraperError {
        status: StatusCode,
        message: String,
    },
    ValidationError {
        message: String,
    },

    // Framework level errors / Redirect errors (which return {"message": "..."})
    MessageError {
        status: StatusCode,
        message: String,
    },
    #[allow(dead_code)]
    RateLimit {
        retry_after: u64,
        limit: u32,
        remaining: u32,
        reset: u64,
    },
}

#[derive(Serialize)]
struct ScraperErrorPayload {
    success: bool,
    message: String,
}

#[derive(Serialize)]
struct MessageErrorPayload {
    message: String,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            AppError::ScraperError { status, message } => {
                tracing::error!("Scraper error (original status {}): {}", status, message);
                let payload = ScraperErrorPayload {
                    success: false,
                    message,
                };
                (StatusCode::BAD_REQUEST, Json(payload)).into_response()
            }
            AppError::ValidationError { message } => {
                let payload = ScraperErrorPayload {
                    success: false,
                    message,
                };
                (StatusCode::BAD_REQUEST, Json(payload)).into_response()
            }
            AppError::MessageError { status, message } => {
                let payload = MessageErrorPayload { message };
                (status, Json(payload)).into_response()
            }
            AppError::RateLimit {
                retry_after,
                limit,
                remaining,
                reset,
            } => {
                let payload = MessageErrorPayload {
                    message: "Too nasty, please slow down".to_string(),
                };
                let mut response = (StatusCode::TOO_MANY_REQUESTS, Json(payload)).into_response();
                
                let headers = response.headers_mut();
                headers.insert("X-RateLimit-Limit", limit.to_string().parse().unwrap());
                headers.insert("X-RateLimit-Remaining", remaining.to_string().parse().unwrap());
                headers.insert("X-RateLimit-Reset", reset.to_string().parse().unwrap());
                headers.insert("Retry-After", retry_after.to_string().parse().unwrap());

                response
            }
        }
    }
}

// Convert other standard errors into AppError
impl From<reqwest::Error> for AppError {
    fn from(err: reqwest::Error) -> Self {
        error!("Upstream HTTP Client Error: {:?}", err);
        AppError::ScraperError {
            status: StatusCode::INTERNAL_SERVER_ERROR,
            message: "Fail to get data".to_string(),
        }
    }
}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        error!("I/O Error: {:?}", err);
        AppError::ScraperError {
            status: StatusCode::INTERNAL_SERVER_ERROR,
            message: "Fail to get data".to_string(),
        }
    }
}

impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        error!("JSON Parsing Error: {:?}", err);
        AppError::ScraperError {
            status: StatusCode::INTERNAL_SERVER_ERROR,
            message: "Fail to get data".to_string(),
        }
    }
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AppError::ScraperError { message, .. } => write!(f, "{}", message),
            AppError::ValidationError { message } => write!(f, "{}", message),
            AppError::MessageError { message, .. } => write!(f, "{}", message),
            AppError::RateLimit { .. } => write!(f, "Too nasty, please slow down"),
        }
    }
}
