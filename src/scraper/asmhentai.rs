use crate::error::AppError;
use crate::jandapress::JandaPress;
use crate::scraper::ASMHENTAI_URL;
use crate::utils::remove_non_numeric;
use scraper::{Html, Selector};
use serde::Serialize;
use serde_json::{Value, json};

#[derive(Serialize)]
pub struct AsmhentaiGetParity {
    pub title: String,
    pub id: i64,
    pub tags: Vec<String>,
    pub total: u32,
    pub image: Vec<String>,
    pub upload_date: String,
}

#[derive(Serialize)]
pub struct AsmhentaiSearchParity {
    pub title: String,
    pub id: i64,
}

use std::sync::LazyLock;

static SEL_COVER_A: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse(".cover a").expect("valid selector: cover_a"));
static SEL_H1: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("h1").expect("valid selector: h1"));
static SEL_TAG: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("span.badge.tag").expect("valid selector: tag"));
static SEL_FIRST_PAGES: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("div.pages").expect("valid selector: first_pages"));
static SEL_FIRST_CHILD: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse(":first-child").expect("valid selector: first_child"));
static SEL_T_PAGES: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("input[id='t_pages']").expect("valid selector: t_pages"));
static SEL_IMG_DATA_SRC: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("img[data-src]").expect("valid selector: img_data_src"));
static SEL_H3: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("div.pages h3").expect("valid selector: h3"));
static SEL_IMAGE_DIV: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("div.image").expect("valid selector: image_div"));
static SEL_IMG: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("img").expect("valid selector: img"));
static SEL_A: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("a").expect("valid selector: a"));

pub fn prune_search_html(html: &str) -> &str {
    // Cut trailing DOM (footer, scripts, trackers) after search results
    let end_pos = html
        .find("<footer")
        .or_else(|| html.find("id=\"footer\""))
        .or_else(|| html.rfind("class=\"pagination\""))
        .or_else(|| html.rfind("class=\"page-nav\""))
        .unwrap_or(html.len());
    &html[..end_pos]
}

pub fn prune_gallery_html(html: &str) -> &str {
    // Cut trailing DOM after gallery info (related section, footer)
    let end_pos = html
        .find("id=\"related\"")
        .or_else(|| html.find("class=\"related\""))
        .or_else(|| html.find("<footer"))
        .or_else(|| html.find("id=\"footer\""))
        .unwrap_or(html.len());
    &html[..end_pos]
}

fn parse_get_document(document: &Html, fallback_book_id: &str) -> Option<AsmhentaiGetParity> {
    let actual_id_path = document
        .select(&SEL_COVER_A)
        .next()
        .and_then(|el| el.value().attr("href"))
        .unwrap_or("");

    let book = actual_id_path
        .replace("/gallery/", "")
        .split('/')
        .next()
        .unwrap_or(fallback_book_id)
        .to_string();
    let actual_book = book
        .parse::<i64>()
        .unwrap_or_else(|_| fallback_book_id.parse::<i64>().unwrap_or(0));

    let title = document
        .select(&SEL_H1)
        .next()
        .map(|el| el.text().collect::<String>().trim().to_string())
        .unwrap_or_default();

    let tags_clean: Vec<String> = document
        .select(&SEL_TAG)
        .map(|el| {
            let text = el.text().collect::<String>();
            text.chars()
                .filter(|c| !c.is_ascii_digit() && *c != '.' && *c != ',' && *c != '(' && *c != ')')
                .collect::<String>()
                .trim()
                .to_string()
        })
        .collect();

    let total_if_broken = document
        .select(&SEL_FIRST_PAGES)
        .next()
        .map(|el| {
            el.select(&SEL_FIRST_CHILD)
                .next()
                .map(|first| first.text().collect::<String>())
                .unwrap_or_default()
        })
        .unwrap_or_default();

    let actual_total = remove_non_numeric(&total_if_broken);

    let total_val = document
        .select(&SEL_T_PAGES)
        .next()
        .and_then(|el| el.value().attr("value"))
        .unwrap_or(&actual_total);
    let total = total_val.parse::<u32>().unwrap_or(0);

    let img = document
        .select(&SEL_IMG_DATA_SRC)
        .next()
        .and_then(|el| el.value().attr("data-src"))
        .unwrap_or("");

    let image_url = img.replace("//", "https://");

    let date: Vec<String> = document
        .select(&SEL_H3)
        .map(|el| el.text().collect::<String>().trim().to_string())
        .collect();

    let mut image = Vec::new();
    if !image_url.is_empty() {
        for i in 0..total {
            image.push(image_url.replace("cover", &(i + 1).to_string()));
        }
    }

    if image.is_empty() {
        return None;
    }

    let upload_date = if date.len() >= 2 {
        date[1].clone()
    } else {
        "Unknown".to_string()
    };

    Some(AsmhentaiGetParity {
        title,
        id: actual_book,
        tags: tags_clean,
        total,
        image,
        upload_date,
    })
}

fn parse_search_document(document: &Html) -> Vec<AsmhentaiSearchParity> {
    let mut content = Vec::new();

    for el in document.select(&SEL_IMAGE_DIV) {
        let title_raw = el
            .select(&SEL_IMG)
            .next()
            .and_then(|img| img.value().attr("alt"))
            .unwrap_or("");

        let title = title_raw.split('\n').next().unwrap_or("").to_string();

        let href_raw = el
            .select(&SEL_A)
            .next()
            .and_then(|a| a.value().attr("href"))
            .unwrap_or("");

        let id = remove_non_numeric(href_raw).parse::<i64>().unwrap_or(0);

        if !title.is_empty() && id > 0 {
            content.push(AsmhentaiSearchParity { title, id });
        }
    }

    content
}

// --- Scraper Implementation ---

pub async fn scrape_get(janda: &JandaPress, book_id: &str) -> Result<Value, AppError> {
    let url = format!("{}/g/{}/", ASMHENTAI_URL, book_id);
    let bytes = janda.fetch_body(&url).await?;
    let html_str = String::from_utf8_lossy(&bytes);

    // Fast path: Pruned gallery DOM
    let pruned = prune_gallery_html(&html_str);
    let doc = Html::parse_document(pruned);
    let parsed_opt = parse_get_document(&doc, book_id);

    // Adaptive fallback: If images missing or parse failed, parse full document
    let data_parity = match parsed_opt {
        Some(res) => res,
        None if pruned.len() < html_str.len() => {
            let full_doc = Html::parse_document(&html_str);
            parse_get_document(&full_doc, book_id).ok_or_else(|| AppError::ScraperError {
                status: axum::http::StatusCode::NOT_FOUND,
                message: "Not found".to_string(),
            })?
        }
        None => {
            return Err(AppError::ScraperError {
                status: axum::http::StatusCode::NOT_FOUND,
                message: "Not found".to_string(),
            });
        }
    };

    let actual_book = data_parity.id;

    Ok(json!({
        "success": true,
        "data": data_parity,
        "source": format!("{}/g/{}/", ASMHENTAI_URL, actual_book)
    }))
}

pub async fn scrape_search(janda: &JandaPress, key: &str, page: u32) -> Result<Value, AppError> {
    let url = format!(
        "{}/search/?q={}&page={}",
        ASMHENTAI_URL,
        urlencoding::encode(key),
        page
    );
    let bytes = janda.fetch_body(&url).await?;
    let html_str = String::from_utf8_lossy(&bytes);

    // Fast path: Pruned search DOM
    let pruned = prune_search_html(&html_str);
    let document = Html::parse_document(pruned);
    let mut content = parse_search_document(&document);

    // Adaptive fallback
    if content.is_empty() && pruned.len() < html_str.len() {
        let full_doc = Html::parse_document(&html_str);
        content = parse_search_document(&full_doc);
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
        "sort": "",
        "source": url
    }))
}

pub async fn scrape_random(janda: &JandaPress) -> Result<Value, AppError> {
    let url = format!("{}/random/", ASMHENTAI_URL);
    let bytes = janda.fetch_body(&url).await?;
    let html_str = String::from_utf8_lossy(&bytes);

    let book = {
        let resolve_book = |doc: &Html| -> String {
            let actual_id_path = doc
                .select(&SEL_COVER_A)
                .next()
                .and_then(|el| el.value().attr("href"))
                .unwrap_or("");

            actual_id_path
                .replace("/gallery/", "")
                .split('/')
                .next()
                .unwrap_or("")
                .to_string()
        };

        let pruned = prune_gallery_html(&html_str);
        let doc = Html::parse_document(pruned);
        let mut b = resolve_book(&doc);

        // Adaptive fallback
        if b.is_empty() && pruned.len() < html_str.len() {
            let full_doc = Html::parse_document(&html_str);
            b = resolve_book(&full_doc);
        }
        b
    };

    if book.is_empty() {
        return Err(AppError::ScraperError {
            status: axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            message: "Failed to resolve random gallery id".to_string(),
        });
    }

    let mut get_result = scrape_get(janda, &book).await?;

    if let Some(obj) = get_result.as_object_mut() {
        obj.insert(
            "source".to_string(),
            json!(format!("{}/g/{}/", ASMHENTAI_URL, book)),
        );
    }

    Ok(get_result)
}
