use crate::error::AppError;
use crate::jandapress::JandaPress;
use crate::scraper::THREEHENTAI_URL;
use crate::utils::remove_non_numeric;
use scraper::{Html, Selector};
use serde::Serialize;
use serde_json::{json, Value};

#[derive(Serialize)]
pub struct ThreehentaiGetParity {
    pub title: String,
    pub id: i64,
    pub tags: Vec<String>,
    pub total: usize,
    pub image: Vec<String>,
    pub upload_date: String,
}

#[derive(Serialize)]
pub struct ThreehentaiSearchParity {
    pub title: String,
    pub id: i64,
}

// --- Scraper Implementation ---

fn extract_id_from_href(href: &str) -> Option<String> {
    if let Some(pos) = href.find("/d/") {
        let after = &href[pos + 3..];
        let id_part = after.split('/').next().unwrap_or("");
        let clean: String = id_part.chars().filter(|c| c.is_ascii_digit()).collect();
        if !clean.is_empty() {
            return Some(clean);
        }
    }
    None
}

fn extract_gallery_id_from_document(document: &Html) -> Option<String> {
    // 1. Check <link rel="canonical" href="...">
    let canon_sel = Selector::parse("link[rel='canonical']").unwrap();
    if let Some(el) = document.select(&canon_sel).next() {
        if let Some(href) = el.value().attr("href") {
            if let Some(id) = extract_id_from_href(href) {
                return Some(id);
            }
        }
    }

    // 2. Check main-cover link (.main-cover, a.main-cover, #main-cover a)
    let cover_sel = Selector::parse(".main-cover, a.main-cover, #main-cover a, div.main-cover a").unwrap();
    if let Some(el) = document.select(&cover_sel).next() {
        if let Some(href) = el.value().attr("href") {
            if let Some(id) = extract_id_from_href(href) {
                return Some(id);
            }
        }
    }

    // 3. Fallback: check any a with /d/ in href
    let d_sel = Selector::parse("a[href*='/d/']").unwrap();
    for el in document.select(&d_sel) {
        if let Some(href) = el.value().attr("href") {
            if let Some(id) = extract_id_from_href(href) {
                return Some(id);
            }
        }
    }

    None
}

fn parse_gallery_document(document: &Html, book_id: &str) -> Result<Value, AppError> {
    let h1_sel = Selector::parse("h1").unwrap();
    let title = document
        .select(&h1_sel)
        .next()
        .map(|el| el.text().collect::<String>().trim().to_string())
        .unwrap_or_default();

    let mut id = book_id.parse::<i64>().unwrap_or(0);
    if id == 0 {
        if let Some(extracted) = extract_gallery_id_from_document(document) {
            id = extracted.parse::<i64>().unwrap_or(0);
        }
    }

    let filter_elem_sel = Selector::parse("span.filter-elem").unwrap();
    let tags: Vec<String> = document
        .select(&filter_elem_sel)
        .map(|el| {
            let text = el.text().collect::<String>();
            // Clean tags: replace(/<[^>]*>/g, "").replace(/\n/g, "").trim()
            text.replace('\n', " ").trim().to_string()
        })
        .collect();

    // Slice last tag matching: tagsClean.slice(0, tagsClean.length - 1)
    let tags_clean = if !tags.is_empty() {
        tags[0..tags.len().saturating_sub(1)].to_vec()
    } else {
        Vec::new()
    };

    let single_thumb_sel = Selector::parse("div.single-thumb-col img").unwrap();
    let image_srcs: Vec<String> = document
        .select(&single_thumb_sel)
        .filter_map(|el| el.value().attr("data-src").or_else(|| el.value().attr("src")).map(|s| s.to_string()))
        .collect();

    if image_srcs.is_empty() {
        return Err(AppError::ScraperError {
            status: axum::http::StatusCode::NOT_FOUND,
            message: "No result found".to_string(),
        });
    }

    let image_clean: Vec<String> = image_srcs
        .into_iter()
        .map(|img| img.replace("t.", "."))
        .collect();

    let time_sel = Selector::parse("time").unwrap();
    let upload_date = document
        .select(&time_sel)
        .next()
        .map(|el| el.text().collect::<String>().trim().to_string())
        .unwrap_or_default();

    let data_parity = ThreehentaiGetParity {
        title,
        id,
        tags: tags_clean,
        total: image_clean.len(),
        image: image_clean,
        upload_date,
    };

    let final_id_str = if id > 0 { id.to_string() } else { book_id.to_string() };

    Ok(json!({
        "success": true,
        "data": data_parity,
        "source": format!("{}/d/{}", THREEHENTAI_URL, final_id_str)
    }))
}

pub async fn scrape_get(janda: &JandaPress, book_id: &str) -> Result<Value, AppError> {
    let url = format!("{}/d/{}", THREEHENTAI_URL, book_id);
    let bytes = janda.fetch_body(&url).await?;
    let html_str = String::from_utf8_lossy(&bytes);
    let document = Html::parse_document(&html_str);

    parse_gallery_document(&document, book_id)
}

pub async fn scrape_search(janda: &JandaPress, key: &str, page: u32, sort: &str) -> Result<Value, AppError> {
    let url = format!("{}/search?q={}&page={}&sort={}", THREEHENTAI_URL, urlencoding::encode(key), page, urlencoding::encode(sort));
    let bytes = janda.fetch_body(&url).await?;
    let html_str = String::from_utf8_lossy(&bytes);
    let document = Html::parse_document(&html_str);

    let doujin_sel = Selector::parse("div.doujin").unwrap();
    let a_sel = Selector::parse("a").unwrap();
    let title_sel = Selector::parse("div.title").unwrap();

    let mut hrefs = Vec::new();
    let mut titles_clean = Vec::new();

    for el in document.select(&doujin_sel) {
        if let Some(a) = el.select(&a_sel).next() {
            if let Some(h) = a.value().attr("href") {
                hrefs.push(h.to_string());
            }
        }

        if let Some(t_el) = el.select(&title_sel).next() {
            let text = t_el.text().collect::<String>();
            titles_clean.push(text.replace('\n', " ").trim().to_string());
        }
    }

    let mut content = Vec::new();
    for (i, val) in hrefs.iter().enumerate() {
        let id_str = remove_non_numeric(val);
        let id = id_str.parse::<i64>().unwrap_or(0);
        let title = titles_clean.get(i).cloned().unwrap_or_default();

        if id > 0 && !title.is_empty() {
            content.push(ThreehentaiSearchParity { title, id });
        }
    }

    if content.is_empty() {
        return Err(AppError::ScraperError {
            status: axum::http::StatusCode::NOT_FOUND,
            message: "No result found".to_string(),
        });
    }

    Ok(json!({
        "success": true,
        "data": content,
        "page": page,
        "sort": sort,
        "source": url
    }))
}

pub async fn scrape_random(janda: &JandaPress) -> Result<Value, AppError> {
    let url = format!("{}/random", THREEHENTAI_URL);
    let bytes = janda.fetch_body(&url).await?;
    let html_str = String::from_utf8_lossy(&bytes);
    let document = Html::parse_document(&html_str);

    let book = extract_gallery_id_from_document(&document).ok_or_else(|| {
        AppError::ScraperError {
            status: axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            message: "Failed to resolve random gallery id".to_string(),
        }
    })?;

    parse_gallery_document(&document, &book)
}
