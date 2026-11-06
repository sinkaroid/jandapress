use crate::error::AppError;
use crate::jandapress::JandaPress;
use crate::scraper::HENTAIFOX_URL;
use crate::utils::remove_non_numeric;
use scraper::{Html, Selector};
use serde::Serialize;
use serde_json::{json, Value};

#[derive(Serialize)]
pub struct HentaifoxGetParity {
    pub title: String,
    pub id: i64,
    pub tags: Vec<String>,
    pub r#type: String, // represents the extension (extensionImg)
    pub total: u32,
    pub image: Vec<String>,
}

#[derive(Serialize)]
pub struct HentaifoxSearchParity {
    pub title: String,
    pub id: i64,
    pub language: String,
    pub category: String,
    pub link: String,
}

// --- Helper Functions ---

pub async fn hentai_fox_predicted_extension(client: &reqwest::Client, url: &str) -> String {
    match client.head(url).send().await {
        Ok(res) => {
            if res.status().is_success() {
                ".jpg".to_string()
            } else {
                ".webp".to_string()
            }
        }
        Err(_) => ".webp".to_string(),
    }
}

use std::sync::LazyLock;

static SEL_A_BUTTON: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("a.g_button").expect("valid selector: a.g_button"));
static SEL_TAG_BTN: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("a.tag_btn").expect("valid selector: a.tag_btn"));
static SEL_IMG: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("img").expect("valid selector: img"));
static SEL_PAGES: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("span.i_text.pages").expect("valid selector: pages"));
static SEL_INFO_H1: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("div.info h1").expect("valid selector: info_h1"));
static SEL_G_TITLE: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("h2.g_title").expect("valid selector: g_title"));
static SEL_G_CAT: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("h3.g_cat").expect("valid selector: g_cat"));
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

// Helper to parse gallery details from parsed document
fn parse_gallery_document(
    document: &Html,
    book_id: &str,
) -> Option<(i64, String, Vec<String>, u32, String, String)> {
    let id_str = document
        .select(&SEL_A_BUTTON)
        .next()
        .and_then(|el| el.value().attr("href"))
        .and_then(|h| h.split('/').nth(2))
        .unwrap_or(book_id);
    let id = id_str.parse::<i64>().unwrap_or(0);

    let tags: Vec<String> = document
        .select(&SEL_TAG_BTN)
        .map(|el| {
            let text = el.text().collect::<String>();
            text.chars().filter(|c| !c.is_ascii_digit()).collect::<String>().trim().to_string()
        })
        .collect();

    let img_srcs: Vec<String> = document
        .select(&SEL_IMG)
        .filter_map(|el| el.value().attr("data-src").or_else(|| el.value().attr("src")).map(|s| s.to_string()))
        .collect();

    if img_srcs.is_empty() {
        return None;
    }

    let raw_img = &img_srcs[0];
    let mut img1_clean = raw_img.clone();
    if let Some(pos) = img1_clean.rfind('/') {
        let suffix = &img1_clean[pos..];
        if suffix.chars().skip(1).all(|c| c.is_ascii_digit()) {
            img1_clean = img1_clean[..pos].to_string();
        }
    }

    let ext_predict = if img1_clean.starts_with("//") {
        format!("https:{}", img1_clean.replace("t.", "."))
    } else {
        img1_clean.replace("t.", ".")
    };

    let parameter_img2 = if raw_img.starts_with("//") {
        let parts: Vec<&str> = raw_img.split('/').collect();
        let limit = std::cmp::min(parts.len(), 5);
        format!("https:{}", parts[..limit].join("/"))
    } else {
        let parts: Vec<&str> = raw_img.split('/').collect();
        let limit = std::cmp::min(parts.len(), 5);
        parts[..limit].join("/")
    };

    let page_count_str = document
        .select(&SEL_PAGES)
        .next()
        .map(|el| el.text().collect::<String>())
        .unwrap_or_default();
    let page_count = remove_non_numeric(&page_count_str).parse::<u32>().unwrap_or(0);

    let title = document
        .select(&SEL_INFO_H1)
        .next()
        .map(|el| el.text().collect::<String>().trim().to_string())
        .unwrap_or_default();

    Some((id, title, tags, page_count, ext_predict, parameter_img2))
}

fn parse_search_document(document: &Html) -> Vec<HentaifoxSearchParity> {
    let titles: Vec<String> = document
        .select(&SEL_G_TITLE)
        .map(|el| el.text().collect::<String>().trim().to_string())
        .collect();

    let links: Vec<String> = document
        .select(&SEL_G_TITLE)
        .filter_map(|el| el.select(&SEL_A).next())
        .filter_map(|a| a.value().attr("href").and_then(|h| h.split('/').nth(2).map(|s| s.to_string())))
        .collect();

    let categories: Vec<String> = document
        .select(&SEL_G_CAT)
        .filter_map(|el| el.select(&SEL_A).next())
        .filter_map(|a| a.value().attr("href").and_then(|h| h.split('/').nth(2).map(|s| s.to_string())))
        .collect();

    let mut content = Vec::new();
    for (i, title) in titles.iter().enumerate() {
        let link_id = links.get(i).cloned().unwrap_or_default();
        let id = link_id.parse::<i64>().unwrap_or(0);
        let category = categories.get(i).cloned().unwrap_or_default();

        if category.is_empty() {
            continue;
        }

        content.push(HentaifoxSearchParity {
            title: title.clone(),
            id,
            language: "Translated".to_string(),
            category,
            link: format!("{}/gallery/{}/", HENTAIFOX_URL, link_id),
        });
    }
    content
}

// --- Scraper Implementation ---

pub async fn scrape_get(janda: &JandaPress, book_id: &str) -> Result<Value, AppError> {
    let url = format!("{}/gallery/{}/", HENTAIFOX_URL, book_id);
    let bytes = janda.fetch_body(&url).await?;
    let html_str = String::from_utf8_lossy(&bytes);

    // Fast path: Pruned DOM with fallback in isolated scope to guarantee Html is dropped before await
    let (id, title, tags, page_count, ext_predict, parameter_img2) = {
        let pruned = prune_gallery_html(&html_str);
        let doc = Html::parse_document(pruned);
        let parsed_opt = parse_gallery_document(&doc, book_id);

        match parsed_opt {
            Some(res) => Ok(res),
            None if pruned.len() < html_str.len() => {
                let full_doc = Html::parse_document(&html_str);
                parse_gallery_document(&full_doc, book_id).ok_or_else(|| AppError::ScraperError {
                    status: axum::http::StatusCode::NOT_FOUND,
                    message: "No images found".to_string(),
                })
            }
            None => Err(AppError::ScraperError {
                status: axum::http::StatusCode::NOT_FOUND,
                message: "No images found".to_string(),
            }),
        }
    }?;

    let extension_img = hentai_fox_predicted_extension(&janda.client, &ext_predict).await;

    let mut image = Vec::new();
    for i in 0..page_count {
        image.push(format!("{}/{}{}", parameter_img2, i + 1, extension_img));
    }

    let data_parity = HentaifoxGetParity {
        title,
        id,
        tags,
        r#type: extension_img,
        total: page_count,
        image,
    };

    Ok(json!({
        "success": true,
        "data": data_parity,
        "source": format!("{}/gallery/{}/", HENTAIFOX_URL, id)
    }))
}

pub async fn scrape_search(janda: &JandaPress, key: &str, page: u32, sort: &str) -> Result<Value, AppError> {
    let url = format!("{}/search/?q={}&sort={}&page={}", HENTAIFOX_URL, urlencoding::encode(key), urlencoding::encode(sort), page);
    let bytes = janda.fetch_body(&url).await?;
    let html_str = String::from_utf8_lossy(&bytes);

    // Fast path: Pruned search DOM
    let pruned = prune_search_html(&html_str);
    let document = Html::parse_document(pruned);
    let mut content = parse_search_document(&document);

    // Adaptive fallback: if pruned slice returned empty, re-parse full HTML
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
        "sort": sort,
        "source": url
    }))
}

pub async fn scrape_random(janda: &JandaPress) -> Result<Value, AppError> {
    let url = format!("{}/random", HENTAIFOX_URL);
    let bytes = janda.fetch_body(&url).await?;
    let html_str = String::from_utf8_lossy(&bytes);

    let id_str = {
        let resolve_id = |doc: &Html| -> String {
            doc.select(&SEL_A_BUTTON)
                .next()
                .and_then(|el| el.value().attr("href"))
                .and_then(|h| h.split('/').nth(2))
                .unwrap_or("")
                .to_string()
        };

        let pruned = prune_gallery_html(&html_str);
        let doc = Html::parse_document(pruned);
        let mut id = resolve_id(&doc);

        // Adaptive fallback
        if id.is_empty() && pruned.len() < html_str.len() {
            let full_doc = Html::parse_document(&html_str);
            id = resolve_id(&full_doc);
        }
        id
    };

    if id_str.is_empty() {
        return Err(AppError::ScraperError {
            status: axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            message: "Failed to resolve random gallery id".to_string(),
        });
    }

    let mut get_result = scrape_get(janda, &id_str).await?;

    if let Some(obj) = get_result.as_object_mut() {
        obj.insert(
            "source".to_string(),
            json!(format!("{}/gallery/{}/", HENTAIFOX_URL, id_str)),
        );
    }

    Ok(get_result)
}
