use crate::error::AppError;
use crate::jandapress::JandaPress;
use crate::scraper::ASMHENTAI_URL;
use crate::utils::remove_non_numeric;
use scraper::{Html, Selector};
use serde::Serialize;
use serde_json::{json, Value};

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

// --- Scraper Implementation ---

pub async fn scrape_get(janda: &JandaPress, book_id: &str) -> Result<Value, AppError> {
    let url = format!("{}/g/{}/", ASMHENTAI_URL, book_id);
    let bytes = janda.fetch_body(&url).await?;
    let html_str = String::from_utf8_lossy(&bytes);
    let document = Html::parse_document(&html_str);

    let cover_a_sel = Selector::parse(".cover a").unwrap();
    let actual_id_path = document
        .select(&cover_a_sel)
        .next()
        .and_then(|el| el.value().attr("href"))
        .unwrap_or("");
    
    let book = actual_id_path
        .replace("/gallery/", "")
        .split('/')
        .next()
        .unwrap_or("")
        .to_string();
    let actual_book = book.parse::<i64>().unwrap_or(0);

    let h1_sel = Selector::parse("h1").unwrap();
    let title = document
        .select(&h1_sel)
        .next()
        .map(|el| el.text().collect::<String>().trim().to_string())
        .unwrap_or_default();

    let tag_sel = Selector::parse("span.badge.tag").unwrap();
    let tags_clean: Vec<String> = document
        .select(&tag_sel)
        .map(|el| {
            let text = el.text().collect::<String>();
            // Clean tags: replace(/[0-9]|[.,()]/g, "").trim()
            text.chars()
                .filter(|c| !c.is_ascii_digit() && *c != '.' && *c != ',' && *c != '(' && *c != ')')
                .collect::<String>()
                .trim()
                .to_string()
        })
        .collect();

    let first_pages_sel = Selector::parse("div.pages").unwrap();
    let total_if_broken = document
        .select(&first_pages_sel)
        .next()
        .map(|el| {
            el.select(&Selector::parse(":first-child").unwrap())
                .next()
                .map(|first| first.text().collect::<String>())
                .unwrap_or_default()
        })
        .unwrap_or_default();
    
    let actual_total = remove_non_numeric(&total_if_broken);
    
    let t_pages_sel = Selector::parse("input[id='t_pages']").unwrap();
    let total_val = document
        .select(&t_pages_sel)
        .next()
        .and_then(|el| el.value().attr("value"))
        .unwrap_or(&actual_total);
    let total = total_val.parse::<u32>().unwrap_or(0);

    let img_sel = Selector::parse("img[data-src]").unwrap();
    let img = document
        .select(&img_sel)
        .next()
        .and_then(|el| el.value().attr("data-src"))
        .unwrap_or("");

    let image_url = img.replace("//", "https://");

    let h3_sel = Selector::parse("div.pages h3").unwrap();
    let date: Vec<String> = document
        .select(&h3_sel)
        .map(|el| el.text().collect::<String>().trim().to_string())
        .collect();

    let mut image = Vec::new();
    if !image_url.is_empty() {
        for i in 0..total {
            image.push(image_url.replace("cover", &(i + 1).to_string()));
        }
    }

    if image.is_empty() {
        return Err(AppError::ScraperError {
            status: axum::http::StatusCode::NOT_FOUND,
            message: "Not found".to_string(),
        });
    }

    let upload_date = if date.len() >= 2 {
        date[1].clone()
    } else {
        "Unknown".to_string()
    };

    let data_parity = AsmhentaiGetParity {
        title,
        id: actual_book,
        tags: tags_clean,
        total,
        image,
        upload_date,
    };

    Ok(json!({
        "success": true,
        "data": data_parity,
        "source": format!("{}/g/{}/", ASMHENTAI_URL, actual_book)
    }))
}

pub async fn scrape_search(janda: &JandaPress, key: &str, page: u32) -> Result<Value, AppError> {
    let url = format!("{}/search/?q={}&page={}", ASMHENTAI_URL, urlencoding::encode(key), page);
    let bytes = janda.fetch_body(&url).await?;
    let html_str = String::from_utf8_lossy(&bytes);
    let document = Html::parse_document(&html_str);

    let image_div_sel = Selector::parse("div.image").unwrap();
    let img_sel = Selector::parse("img").unwrap();
    let a_sel = Selector::parse("a").unwrap();

    let mut content = Vec::new();

    for el in document.select(&image_div_sel) {
        let title_raw = el
            .select(&img_sel)
            .next()
            .and_then(|img| img.value().attr("alt"))
            .unwrap_or("");
        
        let title = title_raw.split('\n').next().unwrap_or("").to_string();

        let href_raw = el
            .select(&a_sel)
            .next()
            .and_then(|a| a.value().attr("href"))
            .unwrap_or("");
        
        let id = remove_non_numeric(href_raw).parse::<i64>().unwrap_or(0);

        if !title.is_empty() && id > 0 {
            content.push(AsmhentaiSearchParity { title, id });
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
        "sort": "", // Matches legacy `sort: url.split("/search/")[1].split("?")[0]` if no search route used directly, we can leave empty or parse.
        "source": url
    }))
}

pub async fn scrape_random(janda: &JandaPress) -> Result<Value, AppError> {
    let url = format!("{}/random/", ASMHENTAI_URL);
    let bytes = janda.fetch_body(&url).await?;
    
    let book = {
        let html_str = String::from_utf8_lossy(&bytes);
        let document = Html::parse_document(&html_str);

        let cover_a_sel = Selector::parse(".cover a").unwrap();
        let actual_id_path = document
            .select(&cover_a_sel)
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
