use crate::error::AppError;
use crate::jandapress::JandaPress;
use crate::scraper::PURURIN_URL;
use scraper::{Html, Selector};
use serde::Serialize;
use serde_json::{json, Value};

#[derive(Serialize)]
pub struct PururinGetParity {
    pub title: String,
    pub id: i64,
    pub tags: Vec<String>,
    pub extension: String,
    pub total: u32,
    pub image: Vec<String>,
}

#[derive(Serialize)]
pub struct PururinSearchParity {
    pub title: String,
    pub cover: Option<String>,
    pub id: i64,
    pub language: String,
    pub info: String,
    pub total: u32,
}

// --- Helper Functions ---

fn get_pururin_info(value: &str) -> String {
    // Replace newlines with spaces and squeeze multiple spaces into one, then trim
    let stepped = value.replace('\n', " ");
    let mut result = String::new();
    let mut last_was_space = false;
    for c in stepped.chars() {
        if c.is_whitespace() {
            if !last_was_space {
                result.push(' ');
                last_was_space = true;
            }
        } else {
            result.push(c);
            last_was_space = false;
        }
    }
    result.trim().to_string()
}

fn get_pururin_page_count(value: &str) -> u32 {
    let cleaned = get_pururin_info(value);
    if let Some(last_part) = cleaned.split(", ").last() {
        if let Some(first_word) = last_part.split_whitespace().next() {
            return first_word.parse::<u32>().unwrap_or(0);
        }
    }
    0
}

fn get_pururin_language(value: &str) -> String {
    let parts: Vec<&str> = value.split(',').collect();
    if parts.len() >= 2 {
        parts.iter().rev().nth(1).map(|s| s.trim().to_string()).unwrap_or_else(|| "Unknown".to_string())
    } else {
        "Unknown".to_string()
    }
}

fn get_url(url: &str) -> String {
    if url.starts_with("//") {
        format!("https:{}", url)
    } else {
        url.to_string()
    }
}

// --- Scraper Implementation ---

pub async fn scrape_get(janda: &JandaPress, book_id: &str) -> Result<Value, AppError> {
    let url = format!("{}/gallery/{}/janda", PURURIN_URL, book_id);
    let bytes = janda.fetch_body(&url).await?;
    let html_str = String::from_utf8_lossy(&bytes);
    let document = Html::parse_document(&html_str);

    let meta_title_sel = Selector::parse("meta[property='og:title']").unwrap();
    let title = document
        .select(&meta_title_sel)
        .next()
        .and_then(|el| el.value().attr("content"))
        .ok_or_else(|| AppError::ScraperError {
            status: axum::http::StatusCode::NOT_FOUND,
            message: "Not found".to_string(),
        })?
        .to_string();

    let tag_li_sel = Selector::parse("div.content-wrapper ul.list-inline li").unwrap();
    let tags: Vec<String> = document
        .select(&tag_li_sel)
        .map(|el| get_pururin_info(&el.text().collect::<String>()))
        .collect();

    let meta_image_sel = Selector::parse("meta[property='og:image']").unwrap();
    let cover = document
        .select(&meta_image_sel)
        .next()
        .and_then(|el| el.value().attr("content"))
        .unwrap_or("");

    let extension = if !cover.is_empty() {
        format!(".{}", cover.split('.').last().unwrap_or("jpg"))
    } else {
        ".jpg".to_string()
    };

    let pages_sel = Selector::parse("span[itemprop='numberOfPages']").unwrap();
    let total = document
        .select(&pages_sel)
        .next()
        .and_then(|el| el.text().collect::<String>().trim().parse::<u32>().ok())
        .unwrap_or(0);

    let meta_url_sel = Selector::parse("meta[property='og:url']").unwrap();
    let id_str = document
        .select(&meta_url_sel)
        .next()
        .and_then(|el| el.value().attr("content"))
        .and_then(|url| url.split('/').nth(4))
        .unwrap_or("0");
    let id = id_str.parse::<i64>().unwrap_or(0);

    let mut image = Vec::new();
    if !cover.is_empty() {
        for i in 0..total {
            let replaced = cover.replace("cover", &(i + 1).to_string());
            image.push(get_url(&replaced));
        }
    }

    let data_parity = PururinGetParity {
        title,
        id,
        tags,
        extension,
        total,
        image,
    };

    Ok(json!({
        "success": true,
        "data": data_parity,
        "source": format!("{}/gallery/{}/janda", PURURIN_URL, id)
    }))
}

pub async fn scrape_search(janda: &JandaPress, key: &str, page: u32) -> Result<Value, AppError> {
    let url = format!("{}/search?q={}&page={}", PURURIN_URL, urlencoding::encode(key), page);
    let bytes = janda.fetch_body(&url).await?;
    let html_str = String::from_utf8_lossy(&bytes);
    let document = Html::parse_document(&html_str);

    let gallery_sel = Selector::parse(".card.card-gallery").unwrap();
    let info_sel = Selector::parse("div.info").unwrap();
    let img_sel = Selector::parse("img.card-img-top").unwrap();

    let covers: Vec<String> = document
        .select(&img_sel)
        .filter_map(|el| el.value().attr("src").map(|s| s.to_string()))
        .collect();

    let infos: Vec<String> = document
        .select(&info_sel)
        .map(|el| get_pururin_info(&el.text().collect::<String>()))
        .collect();

    let mut content = Vec::new();

    for (index, abc) in document.select(&gallery_sel).enumerate() {
        let title = abc.value().attr("title").unwrap_or("").to_string();
        let cover = covers.get(index).cloned();
        
        let data_gid_str = abc.value().attr("data-gid").unwrap_or("0");
        let id = data_gid_str.parse::<i64>().unwrap_or(0);

        let info_str = infos.get(index).cloned().unwrap_or_default();
        let language = get_pururin_language(&info_str);
        let total = get_pururin_page_count(&info_str);
        content.push(PururinSearchParity {
            title,
            cover,
            id,
            language,
            info: info_str,
            total,
        });
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
        "sort": null,
        "source": url
    }))
}

pub async fn scrape_random(janda: &JandaPress) -> Result<Value, AppError> {
    let url = format!("{}/random", PURURIN_URL);
    let bytes = janda.fetch_body(&url).await?;
    
    let id_str = {
        let html_str = String::from_utf8_lossy(&bytes);
        let document = Html::parse_document(&html_str);

        let meta_url_sel = Selector::parse("meta[property='og:url']").unwrap();
        document
            .select(&meta_url_sel)
            .next()
            .and_then(|el| el.value().attr("content"))
            .and_then(|url| url.split('/').nth(4))
            .unwrap_or("")
            .to_string()
    };

    if id_str.is_empty() {
        return Err(AppError::ScraperError {
            status: axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            message: "Failed to resolve random gallery id".to_string(),
        });
    }

    // Call get using the resolved ID
    let mut get_result = scrape_get(janda, &id_str).await?;

    if let Some(obj) = get_result.as_object_mut() {
        obj.insert(
            "source".to_string(),
            json!(format!("{}/gallery/{}/janda", PURURIN_URL, id_str)),
        );
    }

    Ok(get_result)
}
