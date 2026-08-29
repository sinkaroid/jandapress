use crate::error::AppError;
use crate::jandapress::JandaPress;
use crate::scraper::{asmhentai, hentai2read, hentaifox, nhentai, pururin, simply_hentai, threehentai};
use crate::utils::is_numeric;
use axum::{
    extract::{Query, State},
    Json,
};
use serde::Deserialize;
use serde_json::Value;

// --- Query Parameter Structs ---

#[derive(Deserialize)]
pub struct BookQuery {
    pub book: Option<String>,
}

#[derive(Deserialize)]
pub struct SearchQuery {
    pub key: Option<String>,
    pub page: Option<String>,
    pub sort: Option<String>,
}

// --- Parameter Validation Helpers ---

fn validate_page(page_str: Option<&str>) -> Result<u32, AppError> {
    match page_str {
        None => Ok(1),
        Some(s) if s.trim().is_empty() => Ok(1),
        Some(s) => {
            match s.parse::<u32>() {
                Ok(val) if val >= 1 => Ok(val),
                _ => Err(AppError::ValidationError {
                    message: "Parameter page must be positive integer".to_string(),
                }),
            }
        }
    }
}

fn validate_nhentai_sort(sort_str: Option<&str>) -> Result<String, AppError> {
    let sort = sort_str.filter(|s| !s.trim().is_empty()).unwrap_or("date");
    let allowed = ["date", "popular", "popular-today", "popular-week", "popular-month"];
    if allowed.contains(&sort) {
        Ok(sort.to_string())
    } else {
        Err(AppError::ValidationError {
            message: format!("Invalid sort: {}", allowed.join(", ")),
        })
    }
}

fn validate_hentaifox_sort(sort_str: Option<&str>) -> Result<String, AppError> {
    let sort = sort_str.filter(|s| !s.trim().is_empty()).unwrap_or("latest");
    let allowed = ["latest", "popular"];
    if allowed.contains(&sort) {
        Ok(sort.to_string())
    } else {
        Err(AppError::ValidationError {
            message: format!("Invalid sort: {}", allowed.join(", ")),
        })
    }
}

fn validate_threehentai_sort(sort_str: Option<&str>) -> Result<String, AppError> {
    let sort = sort_str.filter(|s| !s.trim().is_empty()).unwrap_or("recent");
    let allowed = ["recent", "popular-24h", "popular-7d", "popular"];
    if allowed.contains(&sort) {
        Ok(sort.to_string())
    } else {
        Err(AppError::ValidationError {
            message: format!("Invalid sort: {}", allowed.join(", ")),
        })
    }
}

// --- nhentai Route Handlers ---

pub async fn nhentai_get(
    State(janda): State<JandaPress>,
    Query(query): Query<BookQuery>,
) -> Result<Json<Value>, AppError> {
    let book = query.book.filter(|s| !s.trim().is_empty()).ok_or_else(|| {
        AppError::ValidationError {
            message: "Parameter book is required".to_string(),
        }
    })?;

    if !is_numeric(&book) {
        return Err(AppError::ValidationError {
            message: "Parameter book must be number".to_string(),
        });
    }

    let data = nhentai::scrape_get(&janda, &book).await?;
    Ok(Json(data))
}

pub async fn nhentai_search(
    State(janda): State<JandaPress>,
    Query(query): Query<SearchQuery>,
) -> Result<Json<Value>, AppError> {
    let key = query.key.filter(|s| !s.trim().is_empty()).ok_or_else(|| {
        AppError::ValidationError {
            message: "Parameter key is required".to_string(),
        }
    })?;

    let page = validate_page(query.page.as_deref())?;
    let sort = validate_nhentai_sort(query.sort.as_deref())?;

    let data = nhentai::scrape_search(&janda, &key, page, &sort).await?;
    Ok(Json(data))
}

pub async fn nhentai_related(
    State(janda): State<JandaPress>,
    Query(query): Query<BookQuery>,
) -> Result<Json<Value>, AppError> {
    let book = query.book.filter(|s| !s.trim().is_empty()).ok_or_else(|| {
        AppError::ValidationError {
            message: "Parameter book is required".to_string(),
        }
    })?;

    if !is_numeric(&book) {
        return Err(AppError::ValidationError {
            message: "Parameter book must be number".to_string(),
        });
    }

    let data = nhentai::scrape_related(&janda, &book).await?;
    Ok(Json(data))
}

pub async fn nhentai_random(State(janda): State<JandaPress>) -> Result<Json<Value>, AppError> {
    let data = nhentai::scrape_random(&janda).await?;
    Ok(Json(data))
}

// --- pururin Route Handlers ---

pub async fn pururin_get(
    State(janda): State<JandaPress>,
    Query(query): Query<BookQuery>,
) -> Result<Json<Value>, AppError> {
    let book = query.book.filter(|s| !s.trim().is_empty()).ok_or_else(|| {
        AppError::ValidationError {
            message: "Parameter book is required".to_string(),
        }
    })?;

    if !is_numeric(&book) {
        return Err(AppError::ValidationError {
            message: "Parameter book must be number".to_string(),
        });
    }

    let data = pururin::scrape_get(&janda, &book).await?;
    Ok(Json(data))
}

pub async fn pururin_search(
    State(janda): State<JandaPress>,
    Query(query): Query<SearchQuery>,
) -> Result<Json<Value>, AppError> {
    let key = query.key.filter(|s| !s.trim().is_empty()).ok_or_else(|| {
        AppError::ValidationError {
            message: "Parameter key is required".to_string(),
        }
    })?;

    let page = validate_page(query.page.as_deref())?;

    let data = pururin::scrape_search(&janda, &key, page).await?;
    Ok(Json(data))
}

pub async fn pururin_random(State(janda): State<JandaPress>) -> Result<Json<Value>, AppError> {
    let data = pururin::scrape_random(&janda).await?;
    Ok(Json(data))
}

// --- hentaifox Route Handlers ---

pub async fn hentaifox_get(
    State(janda): State<JandaPress>,
    Query(query): Query<BookQuery>,
) -> Result<Json<Value>, AppError> {
    let book = query.book.filter(|s| !s.trim().is_empty()).ok_or_else(|| {
        AppError::ValidationError {
            message: "Parameter book is required".to_string(),
        }
    })?;

    if !is_numeric(&book) {
        return Err(AppError::ValidationError {
            message: "Parameter book must be number".to_string(),
        });
    }

    let data = hentaifox::scrape_get(&janda, &book).await?;
    Ok(Json(data))
}

pub async fn hentaifox_search(
    State(janda): State<JandaPress>,
    Query(query): Query<SearchQuery>,
) -> Result<Json<Value>, AppError> {
    let key = query.key.filter(|s| !s.trim().is_empty()).ok_or_else(|| {
        AppError::ValidationError {
            message: "Parameter key is required".to_string(),
        }
    })?;

    let page = validate_page(query.page.as_deref())?;
    let sort = validate_hentaifox_sort(query.sort.as_deref())?;

    let data = hentaifox::scrape_search(&janda, &key, page, &sort).await?;
    Ok(Json(data))
}

pub async fn hentaifox_random(State(janda): State<JandaPress>) -> Result<Json<Value>, AppError> {
    let data = hentaifox::scrape_random(&janda).await?;
    Ok(Json(data))
}

// --- asmhentai Route Handlers ---

pub async fn asmhentai_get(
    State(janda): State<JandaPress>,
    Query(query): Query<BookQuery>,
) -> Result<Json<Value>, AppError> {
    let book = query.book.filter(|s| !s.trim().is_empty()).ok_or_else(|| {
        AppError::ValidationError {
            message: "Parameter book is required".to_string(),
        }
    })?;

    if !is_numeric(&book) {
        return Err(AppError::ValidationError {
            message: "Parameter book must be number".to_string(),
        });
    }

    let data = asmhentai::scrape_get(&janda, &book).await?;
    Ok(Json(data))
}

pub async fn asmhentai_search(
    State(janda): State<JandaPress>,
    Query(query): Query<SearchQuery>,
) -> Result<Json<Value>, AppError> {
    let key = query.key.filter(|s| !s.trim().is_empty()).ok_or_else(|| {
        AppError::ValidationError {
            message: "Parameter key is required".to_string(),
        }
    })?;

    let page = validate_page(query.page.as_deref())?;

    let data = asmhentai::scrape_search(&janda, &key, page).await?;
    Ok(Json(data))
}

pub async fn asmhentai_random(State(janda): State<JandaPress>) -> Result<Json<Value>, AppError> {
    let data = asmhentai::scrape_random(&janda).await?;
    Ok(Json(data))
}

// --- hentai2read Route Handlers ---

pub async fn hentai2read_get(
    State(janda): State<JandaPress>,
    Query(query): Query<BookQuery>,
) -> Result<Json<Value>, AppError> {
    let book = query.book.filter(|s| !s.trim().is_empty()).ok_or_else(|| {
        AppError::ValidationError {
            message: "Parameter book is required".to_string(),
        }
    })?;

    if book.split('/').count() != 2 {
        return Err(AppError::ValidationError {
            message: "Book must be in format 'book_example/chapter'. Example: 'fate_lewd_summoning/1'".to_string(),
        });
    }

    let data = hentai2read::scrape_get(&janda, &book).await?;
    Ok(Json(data))
}

pub async fn hentai2read_search(
    State(janda): State<JandaPress>,
    Query(query): Query<SearchQuery>,
) -> Result<Json<Value>, AppError> {
    let key = query.key.filter(|s| !s.trim().is_empty()).ok_or_else(|| {
        AppError::ValidationError {
            message: "Parameter key is required".to_string(),
        }
    })?;

    let data = hentai2read::scrape_search(&janda, &key).await?;
    Ok(Json(data))
}

// --- simply-hentai Route Handlers ---

pub async fn simply_hentai_get(
    State(janda): State<JandaPress>,
    Query(query): Query<BookQuery>,
) -> Result<Json<Value>, AppError> {
    let book = query.book.filter(|s| !s.trim().is_empty()).ok_or_else(|| {
        AppError::ValidationError {
            message: "Parameter book is required, Example: idolmaster/from-fumika-fc8496c/all-pages".to_string(),
        }
    })?;

    let data = simply_hentai::scrape_get(&janda, &book).await?;
    Ok(Json(data))
}

// --- 3hentai Route Handlers ---

pub async fn threehentai_get(
    State(janda): State<JandaPress>,
    Query(query): Query<BookQuery>,
) -> Result<Json<Value>, AppError> {
    let book = query.book.filter(|s| !s.trim().is_empty()).ok_or_else(|| {
        AppError::ValidationError {
            message: "Parameter book is required".to_string(),
        }
    })?;

    if !is_numeric(&book) {
        return Err(AppError::ValidationError {
            message: "Parameter book must be number".to_string(),
        });
    }

    let data = threehentai::scrape_get(&janda, &book).await?;
    Ok(Json(data))
}

pub async fn threehentai_search(
    State(janda): State<JandaPress>,
    Query(query): Query<SearchQuery>,
) -> Result<Json<Value>, AppError> {
    let key = query.key.filter(|s| !s.trim().is_empty()).ok_or_else(|| {
        AppError::ValidationError {
            message: "Parameter key is required".to_string(),
        }
    })?;

    let page = validate_page(query.page.as_deref())?;
    let sort = validate_threehentai_sort(query.sort.as_deref())?;

    let data = threehentai::scrape_search(&janda, &key, page, &sort).await?;
    Ok(Json(data))
}

pub async fn threehentai_random(State(janda): State<JandaPress>) -> Result<Json<Value>, AppError> {
    let data = threehentai::scrape_random(&janda).await?;
    Ok(Json(data))
}
