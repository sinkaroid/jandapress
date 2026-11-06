use crate::error::AppError;
use crate::jandapress::JandaPress;
use crate::scraper::{SIMPLY_HENTAI_PROXIFIED_URL, SIMPLY_HENTAI_URL};
use axum::http::StatusCode;
use scraper::{Html, Selector};
use serde::Serialize;
use serde_json::{json, Value};
use std::sync::LazyLock;

static NEXT_DATA_SEL: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("script#__NEXT_DATA__").expect("valid selector: __NEXT_DATA__"));

pub fn extract_next_data(html: &str) -> Option<&str> {
    let marker = html.find("id=\"__NEXT_DATA__\"")
        .or_else(|| html.find("id='__NEXT_DATA__'"))?;
    let content_start = html[marker..].find('>')? + marker + 1;
    let content_end = html[content_start..].find("</script>")? + content_start;
    Some(html[content_start..content_end].trim())
}

#[derive(Serialize)]
pub struct SimplyHentaiGetParity {
    pub title: String,
    pub id: String,
    pub tags: Vec<String>,
    pub total: usize,
    pub image: Vec<String>,
    pub language: String,
}

pub async fn check_mock(janda: &JandaPress, url: &str) -> bool {
    janda.check_simply_hentai_mock(url).await
}

pub async fn scrape_get(janda: &JandaPress, book_path: &str) -> Result<Value, AppError> {
    let mut actual_api = SIMPLY_HENTAI_URL;
    if !check_mock(janda, SIMPLY_HENTAI_URL).await {
        actual_api = SIMPLY_HENTAI_PROXIFIED_URL;
    }

    let url = format!("{}/{}", actual_api, book_path);
    let bytes = janda.fetch_body(&url).await?;
    let html_str = String::from_utf8_lossy(&bytes);

    // 1. Fast path: zero-DOM string slice extraction
    let fast_json = extract_next_data(&html_str)
        .and_then(|raw_json| serde_json::from_str::<Value>(raw_json).ok());

    let json_val = match fast_json {
        Some(val) => val,
        None => {
            // 2. Adaptive fallback: full DOM parse with LazyLock selector
            let document = Html::parse_document(&html_str);
            let script_content = document
                .select(&NEXT_DATA_SEL)
                .next()
                .map(|el| el.text().collect::<String>())
                .ok_or_else(|| AppError::ScraperError {
                    status: StatusCode::NOT_FOUND,
                    message: "script#__NEXT_DATA__ not found".to_string(),
                })?;

            serde_json::from_str::<Value>(&script_content).map_err(|err| AppError::ScraperError {
                status: StatusCode::INTERNAL_SERVER_ERROR,
                message: format!("Failed to parse __NEXT_DATA__ JSON: {:?}", err),
            })?
        }
    };

    // Navigate to pageProps data
    let data = &json_val["props"]["pageProps"]["data"];
    
    let pages = data["pages"]
        .as_array()
        .ok_or_else(|| AppError::ScraperError {
            status: StatusCode::INTERNAL_SERVER_ERROR,
            message: "Failed to read props.pageProps.data.pages".to_string(),
        })?;

    let mut images = Vec::new();
    for p in pages {
        if let Some(img_url) = p["sizes"]["full"].as_str() {
            images.push(img_url.to_string());
        }
    }

    let mut tags = Vec::new();
    if let Some(tags_val) = data["tags"].as_array() {
        for t in tags_val {
            if let Some(slug) = t["slug"].as_str() {
                tags.push(slug.to_string());
            }
        }
    }

    let language = data["language"]["slug"].as_str().unwrap_or("").to_string();
    let title = json_val["props"]["pageProps"]["meta"]["title"]
        .as_str()
        .unwrap_or("")
        .to_string();

    let id = format!("/{}", book_path);

    let data_parity = SimplyHentaiGetParity {
        title,
        id,
        tags,
        total: images.len(),
        image: images,
        language,
    };

    Ok(json!({
        "success": true,
        "data": data_parity,
        "source": url
    }))
}
