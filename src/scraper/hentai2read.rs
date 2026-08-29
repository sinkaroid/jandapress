use crate::error::AppError;
use crate::jandapress::JandaPress;
use crate::scraper::HENTAI2READ_URL;
use scraper::{Html, Selector};
use serde::Serialize;
use serde_json::{json, Value};

#[derive(Serialize)]
pub struct Hentai2readGetParity {
    pub title: String,
    pub id: String,
    pub image: Vec<String>,
}

#[derive(Serialize)]
pub struct Hentai2readGetPushParity {
    pub data: Hentai2readGetParity,
    pub main_url: String,
    pub current_url: String,
    pub next_url: Option<String>,
    pub previus_url: Option<String>,
}

#[derive(Serialize)]
pub struct Hentai2readSearchParity {
    pub title: String,
    pub cover: String,
    pub id: String,
    pub link: String,
    pub message: String,
}

// --- Scraper Implementation ---

pub async fn scrape_get(janda: &JandaPress, book_id: &str) -> Result<Value, AppError> {
    // book_id has format "butabako_shotaone_matome_fgo_hen/1"
    let url = format!("{}/{}/", HENTAI2READ_URL, book_id);
    let bytes = janda.fetch_body(&url).await?;
    let html_str = String::from_utf8_lossy(&bytes);
    let document = Html::parse_document(&html_str);

    let script_sel = Selector::parse("script").unwrap();
    let mut gdata_content = String::new();

    for el in document.select(&script_sel) {
        let text = el.text().collect::<String>();
        if text.contains("var gData =") {
            gdata_content = text;
            break;
        }
    }

    if gdata_content.is_empty() {
        return Err(AppError::ScraperError {
            status: axum::http::StatusCode::NOT_FOUND,
            message: "var gData script not found in page".to_string(),
        });
    }

    // Clean up var gData = { ... }; to valid JSON
    // Format in page is usually: var gData = { ... };
    let start_pos = gdata_content.find("var gData =").unwrap();
    let mut slice = &gdata_content[start_pos..];
    // Remove the prefix
    slice = &slice["var gData =".len()..];
    // Find the end semicolon
    let end_pos = slice.find(';').unwrap_or(slice.len());
    let raw_json_part = &slice[..end_pos];

    let clean = raw_json_part.trim().replace('\'', "\"");
    
    // Parse using serde_json
    let gdata_json = serde_json::from_str::<Value>(&clean).map_err(|err| {
        AppError::ScraperError {
            status: axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            message: format!("Failed to parse gData JSON: {:?}", err),
        }
    })?;

    let title = gdata_json["title"].as_str().unwrap_or("").to_string();
    let main_url = gdata_json["mainURL"].as_str().unwrap_or("").to_string();
    let current_url = gdata_json["currentURL"].as_str().unwrap_or("").to_string();
    let next_url = gdata_json["nextURL"].as_str().map(|s| s.to_string());
    let previous_url = gdata_json["previousURL"].as_str().map(|s| s.to_string());

    let mut images = Vec::new();
    if let Some(imgs) = gdata_json["images"].as_array() {
        for img in imgs {
            if let Some(img_path) = img.as_str() {
                images.push(format!(
                    "https://cdn-ngocok-static.sinxdr.workers.dev/hentai{}",
                    img_path
                ));
            }
        }
    }

    let id = format!("/{}/", book_id);

    let get_parity = Hentai2readGetParity {
        title,
        id,
        image: images,
    };

    let push_parity = Hentai2readGetPushParity {
        data: get_parity,
        main_url,
        current_url,
        next_url,
        previus_url: previous_url,
    };

    Ok(json!({
        "success": true,
        "data": push_parity.data,
        "main_url": push_parity.main_url,
        "current_url": push_parity.current_url,
        "next_url": push_parity.next_url,
        "previus_url": push_parity.previus_url,
        "source": format!("{}{}", HENTAI2READ_URL, format!("/{}/", book_id))
    }))
}

pub async fn scrape_search(janda: &JandaPress, key: &str) -> Result<Value, AppError> {
    let url = format!("{}/hentai-list/search/{}", HENTAI2READ_URL, key);
    let bytes = janda.fetch_body(&url).await?;
    let html_str = String::from_utf8_lossy(&bytes);
    let document = Html::parse_document(&html_str);

    let title_sel = Selector::parse(".title-text").unwrap();
    let img_sel = Selector::parse("img").unwrap();
    let id_sel = Selector::parse(".overlay-title a").unwrap();

    let titles: Vec<String> = document
        .select(&title_sel)
        .map(|el| el.text().collect::<String>().trim().to_string())
        .collect();

    let img_srcs: Vec<String> = document
        .select(&img_sel)
        .filter_map(|el| el.value().attr("data-src").or_else(|| el.value().attr("src")).map(|s| s.to_string()))
        .collect();

    let ids: Vec<String> = document
        .select(&id_sel)
        .filter_map(|el| el.value().attr("href").map(|s| {
            // getId(url): replace(/^https?:\/\/[^\/]+/, "").replace(/\/$/, "")
            let mut cleaned = s.replace("http://hentai2read.com", "")
                               .replace("https://hentai2read.com", "");
            if cleaned.ends_with('/') {
                cleaned.pop();
            }
            cleaned
        }))
        .collect();

    let mut content = Vec::new();
    for (i, title) in titles.iter().enumerate() {
        let cover_suffix = img_srcs.get(i).cloned().unwrap_or_default();
        let id_clean = ids.get(i).cloned().unwrap_or_default();

        content.push(Hentai2readSearchParity {
            title: title.clone(),
            cover: format!("{}{}", HENTAI2READ_URL, cover_suffix),
            id: id_clean.clone(),
            link: format!("{}{}", HENTAI2READ_URL, id_clean),
            message: "Required chapter number is mandatory".to_string(),
        });
    }

    if content.is_empty() {
        return Err(AppError::ScraperError {
            status: axum::http::StatusCode::NOT_FOUND,
            message: "No result found".to_string(),
        });
    }

    Ok(json!({
        "data": content,
        "source": url
    }))
}
