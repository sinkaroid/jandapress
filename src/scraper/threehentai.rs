use crate::error::AppError;
use crate::jandapress::JandaPress;
use crate::scraper::THREEHENTAI_URL;
use crate::utils::remove_non_numeric;
use scraper::{Html, Selector};
use serde::Serialize;
use serde_json::{Value, json};

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

use std::sync::LazyLock;

static SEL_CANONICAL: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("link[rel='canonical']").expect("valid selector: canonical"));
static SEL_COVER: LazyLock<Selector> = LazyLock::new(|| {
    Selector::parse(".main-cover, a.main-cover, #main-cover a, div.main-cover a")
        .expect("valid selector: cover")
});
static SEL_D_HREF: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("a[href*='/d/']").expect("valid selector: d_href"));
static SEL_H1: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("h1").expect("valid selector: h1"));
static SEL_FILTER_ELEM: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("span.filter-elem").expect("valid selector: filter_elem"));
static SEL_SINGLE_THUMB: LazyLock<Selector> = LazyLock::new(|| {
    Selector::parse("div.single-thumb-col img").expect("valid selector: single_thumb")
});
static SEL_TIME: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("time").expect("valid selector: time"));
static SEL_DOUJIN: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("div.doujin").expect("valid selector: doujin"));
static SEL_A: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("a").expect("valid selector: a"));
static SEL_TITLE: LazyLock<Selector> =
    LazyLock::new(|| Selector::parse("div.title").expect("valid selector: title"));

pub fn prune_search_html(html: &str) -> &str {
    let end_pos = html
        .find("<footer")
        .or_else(|| html.find("id=\"footer\""))
        .or_else(|| html.find("class=\"footer\""))
        .or_else(|| html.rfind("class=\"pagination\""))
        .or_else(|| html.rfind("class=\"page_numbers\""))
        .unwrap_or(html.len());
    &html[..end_pos]
}

pub fn prune_gallery_html(html: &str) -> &str {
    let end_pos = html
        .find("id=\"related\"")
        .or_else(|| html.find("class=\"related\""))
        .or_else(|| html.find("<footer"))
        .or_else(|| html.find("id=\"footer\""))
        .or_else(|| html.find("class=\"footer\""))
        .unwrap_or(html.len());
    &html[..end_pos]
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
    if let Some(el) = document.select(&SEL_CANONICAL).next()
        && let Some(href) = el.value().attr("href")
        && let Some(id) = extract_id_from_href(href)
    {
        return Some(id);
    }

    // 2. Check main-cover link (.main-cover, a.main-cover, #main-cover a)
    if let Some(el) = document.select(&SEL_COVER).next()
        && let Some(href) = el.value().attr("href")
        && let Some(id) = extract_id_from_href(href)
    {
        return Some(id);
    }

    // 3. Fallback: check any a with /d/ in href
    for el in document.select(&SEL_D_HREF) {
        if let Some(href) = el.value().attr("href")
            && let Some(id) = extract_id_from_href(href)
        {
            return Some(id);
        }
    }

    None
}

fn parse_gallery_document(document: &Html, book_id: &str) -> Result<Value, AppError> {
    let title = document
        .select(&SEL_H1)
        .next()
        .map(|el| el.text().collect::<String>().trim().to_string())
        .unwrap_or_default();

    let mut id = book_id.parse::<i64>().unwrap_or(0);
    if id == 0
        && let Some(extracted) = extract_gallery_id_from_document(document)
    {
        id = extracted.parse::<i64>().unwrap_or(0);
    }

    let tags: Vec<String> = document
        .select(&SEL_FILTER_ELEM)
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

    let image_srcs: Vec<String> = document
        .select(&SEL_SINGLE_THUMB)
        .filter_map(|el| {
            el.value()
                .attr("data-src")
                .or_else(|| el.value().attr("src"))
                .map(|s| s.to_string())
        })
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

    let upload_date = document
        .select(&SEL_TIME)
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

    let final_id_str = if id > 0 {
        id.to_string()
    } else {
        book_id.to_string()
    };

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

    // 1. Fast path: parse pruned HTML
    let pruned_html = prune_gallery_html(&html_str);
    let document = Html::parse_document(pruned_html);
    let res = parse_gallery_document(&document, book_id);

    // 2. Adaptive fallback: if pruned parsing failed, re-parse full HTML
    if res.is_err() {
        let full_doc = Html::parse_document(&html_str);
        return parse_gallery_document(&full_doc, book_id);
    }

    res
}

fn parse_search_document(document: &Html) -> Vec<ThreehentaiSearchParity> {
    let mut hrefs = Vec::new();
    let mut titles_clean = Vec::new();

    for el in document.select(&SEL_DOUJIN) {
        if let Some(a) = el.select(&SEL_A).next()
            && let Some(h) = a.value().attr("href")
        {
            hrefs.push(h.to_string());
        }

        if let Some(t_el) = el.select(&SEL_TITLE).next() {
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

    content
}

pub async fn scrape_search(
    janda: &JandaPress,
    key: &str,
    page: u32,
    sort: &str,
) -> Result<Value, AppError> {
    let url = format!(
        "{}/search?q={}&page={}&sort={}",
        THREEHENTAI_URL,
        urlencoding::encode(key),
        page,
        urlencoding::encode(sort)
    );
    let bytes = janda.fetch_body(&url).await?;
    let html_str = String::from_utf8_lossy(&bytes);

    // 1. Fast path: parse pruned HTML
    let pruned_html = prune_search_html(&html_str);
    let mut content = parse_search_document(&Html::parse_document(pruned_html));

    // 2. Adaptive fallback: if pruned search yielded 0 items, re-parse full HTML
    if content.is_empty() {
        content = parse_search_document(&Html::parse_document(&html_str));
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

    let book = {
        // 1. Try fast path
        let pruned_html = prune_gallery_html(&html_str);
        let document = Html::parse_document(pruned_html);
        let book_opt = extract_gallery_id_from_document(&document);

        // 2. Fallback to full document if id could not be extracted from pruned slice
        match book_opt {
            Some(b) => Ok(b),
            None => {
                let full_doc = Html::parse_document(&html_str);
                extract_gallery_id_from_document(&full_doc).ok_or_else(|| AppError::ScraperError {
                    status: axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                    message: "Failed to resolve random gallery id".to_string(),
                })
            }
        }
    }?;

    scrape_get(janda, &book).await
}
