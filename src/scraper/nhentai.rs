#![allow(dead_code)]

use crate::error::AppError;
use crate::jandapress::JandaPress;
use crate::scraper::NHENTAI_URL;
use crate::utils::format_upload_date;
use futures::future::join_all;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::sync::Arc;

// --- Raw API Deserialization Structs ---

#[derive(Deserialize, Debug, Clone)]
pub struct NhentaiTitle {
    pub english: Option<String>,
    pub japanese: Option<String>,
    pub pretty: Option<String>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct NhentaiTag {
    pub id: i64,
    pub r#type: String,
    pub name: String,
    pub url: Option<String>,
    pub count: Option<i64>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct NhentaiV2Page {
    pub path: String,
}

#[derive(Deserialize, Debug, Clone)]
pub struct NhentaiImagePage {
    pub t: Option<String>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct NhentaiImages {
    pub pages: Option<Vec<NhentaiImagePage>>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct NhentaiRawResponse {
    pub id: i64,
    pub media_id: String,
    pub title: NhentaiTitle,
    pub upload_date: i64,
    pub tags: Vec<NhentaiTag>,
    pub num_pages: u32,
    pub num_favorites: u32,
    pub pages: Option<Vec<NhentaiV2Page>>,
    pub images: Option<NhentaiImages>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct NhentaiV2GallerySummary {
    pub id: i64,
    pub media_id: String,
    pub english_title: Option<String>,
    pub japanese_title: Option<String>,
    pub thumbnail: String,
    pub num_pages: u32,
    pub tag_ids: Option<Vec<i64>>,
    pub blacklisted: Option<bool>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct NhentaiV2ListResponse {
    pub result: Vec<NhentaiV2GallerySummary>,
    pub num_pages: u32,
    pub per_page: u32,
    pub total: u32,
}

#[derive(Deserialize, Debug, Clone)]
pub struct NhentaiV2RelatedResponse {
    pub result: Vec<NhentaiV2GallerySummary>,
}

// --- Outgoing REST Parity Structs ---

#[derive(Serialize, Clone)]
pub struct NhentaiTitleParity {
    pub english: String,
    pub japanese: String,
    pub pretty: String,
}

#[derive(Serialize, Clone)]
pub struct NhentaiGetParity {
    pub title: String,
    pub optional_title: NhentaiTitleParity,
    pub id: i64,
    pub language: String,
    pub tags: Vec<String>,
    pub total: usize,
    pub image: Vec<String>,
    pub num_pages: u32,
    pub num_favorites: u32,
    pub artist: Vec<String>,
    pub group: String,
    pub parodies: Vec<String>,
    pub characters: Vec<String>,
    pub upload_date: String,
}

#[derive(Serialize, Clone)]
pub struct NhentaiSearchParity {
    pub title: NhentaiTitleParity,
    pub id: i64,
    pub language: String,
    pub upload_date: String,
    pub total: u32,
    pub cover: String,
    pub tags: Vec<String>,
}

#[derive(Serialize, Clone)]
pub struct NhentaiRelatedParity {
    pub title: NhentaiTitleParity,
    pub id: i64,
    pub language: String,
    pub upload_date: String,
    pub total: u32,
    pub tags: Vec<String>,
}

// --- Scraper Implementation ---

pub async fn scrape_get(janda: &JandaPress, book_id: &str) -> Result<Value, AppError> {
    let url = format!("{}/api/v2/galleries/{}", NHENTAI_URL, book_id);
    let raw_val = janda.fetch_json(&url).await?;
    let raw: NhentaiRawResponse = serde_json::from_value(raw_val)?;

    let cdn = "https://i.nhentai.net";
    let mut image_list = Vec::new();

    if let Some(pages) = &raw.pages {
        for page in pages {
            image_list.push(format!("{}/{}", cdn, page.path));
        }
    } else if let Some(images) = &raw.images {
        if let Some(pages) = &images.pages {
            for (index, page) in pages.iter().enumerate() {
                let ext = match page.t.as_deref() {
                    Some("j") => "jpg",
                    Some("p") => "png",
                    Some("g") => "gif",
                    Some("w") => "webp",
                    _ => "jpg",
                };
                image_list.push(format!(
                    "{}/galleries/{}/{}.{}",
                    cdn,
                    raw.media_id,
                    index + 1,
                    ext
                ));
            }
        }
    }

    let mut tags = Vec::new();
    let mut artist = Vec::new();
    let mut language = String::new();
    let mut parodies = Vec::new();
    let mut group = "None".to_string();
    let mut characters = Vec::new();

    for tag in raw.tags {
        match tag.r#type.as_str() {
            "tag" => tags.push(tag.name),
            "artist" => artist.push(tag.name),
            "language" => {
                if language.is_empty() {
                    language = tag.name;
                }
            }
            "parody" => parodies.push(tag.name),
            "group" => {
                group = tag.name;
            }
            "character" => characters.push(tag.name),
            _ => {}
        }
    }
    tags.sort();

    let pretty = raw.title.pretty.unwrap_or_else(|| {
        raw.title.english.clone().unwrap_or_else(|| raw.title.japanese.clone().unwrap_or_default())
    });

    let data_parity = NhentaiGetParity {
        title: pretty.clone(),
        optional_title: NhentaiTitleParity {
            english: raw.title.english.unwrap_or_default(),
            japanese: raw.title.japanese.unwrap_or_default(),
            pretty,
        },
        id: raw.id,
        language,
        tags,
        total: image_list.len(),
        image: image_list,
        num_pages: raw.num_pages,
        num_favorites: raw.num_favorites,
        artist,
        group,
        parodies,
        characters,
        upload_date: format_upload_date(raw.upload_date),
    };

    Ok(json!({
        "success": true,
        "data": data_parity,
        "source": format!("{}/g/{}", NHENTAI_URL, raw.id)
    }))
}

pub async fn scrape_search(janda: &JandaPress, key: &str, page: u32, sort: &str) -> Result<Value, AppError> {
    let url = format!(
        "{}/api/v2/search?query={}&sort={}&page={}",
        NHENTAI_URL,
        urlencoding::encode(key),
        urlencoding::encode(sort),
        page
    );

    let raw_val = janda.fetch_json(&url).await?;
    let raw: NhentaiV2ListResponse = serde_json::from_value(raw_val)?;

    let tag_map = resolve_tag_map(janda, &raw.result).await;
    let upload_date_map = resolve_upload_date_map(janda, &raw.result.iter().map(|item| item.id).collect::<Vec<_>>()).await;

    let content: Vec<NhentaiSearchParity> = raw.result
        .into_iter()
        .map(|item| {
            let tag_ids = item.tag_ids.unwrap_or_default();
            let mut resolved_tags = Vec::new();
            for tag_id in tag_ids {
                if let Some(tag) = tag_map.get(&tag_id) {
                    resolved_tags.push(tag.clone());
                }
            }

            let language = resolved_tags
                .iter()
                .find(|t| t.r#type == "language")
                .map(|t| t.name.clone())
                .unwrap_or_default();

            let tags = resolved_tags
                .iter()
                .filter(|t| t.r#type == "tag")
                .map(|t| t.name.clone())
                .collect();

            let upload_secs = upload_date_map.get(&item.id).copied().unwrap_or(0);
            let upload_date = if upload_secs > 0 {
                format_upload_date(upload_secs)
            } else {
                "".to_string()
            };

            let english = item.english_title.unwrap_or_default();
            let japanese = item.japanese_title.unwrap_or_default();
            let pretty = if !english.is_empty() {
                english.clone()
            } else {
                japanese.clone()
            };

            NhentaiSearchParity {
                title: NhentaiTitleParity {
                    english,
                    japanese,
                    pretty,
                },
                id: item.id,
                language,
                upload_date,
                total: item.num_pages,
                cover: item.thumbnail,
                tags,
            }
        })
        .collect();

    Ok(json!({
        "success": true,
        "data": content,
        "page": page,
        "sort": sort,
        "source": format!("{}/api/v2/search", NHENTAI_URL)
    }))
}

pub async fn scrape_related(janda: &JandaPress, book_id: &str) -> Result<Value, AppError> {
    let url = format!("{}/api/v2/galleries/{}/related", NHENTAI_URL, book_id);
    let raw_val = janda.fetch_json(&url).await?;
    let raw: NhentaiV2RelatedResponse = serde_json::from_value(raw_val)?;

    let tag_map = resolve_tag_map(janda, &raw.result).await;
    let upload_date_map = resolve_upload_date_map(janda, &raw.result.iter().map(|item| item.id).collect::<Vec<_>>()).await;

    let content: Vec<NhentaiRelatedParity> = raw.result
        .into_iter()
        .map(|item| {
            let tag_ids = item.tag_ids.unwrap_or_default();
            let mut resolved_tags = Vec::new();
            for tag_id in tag_ids {
                if let Some(tag) = tag_map.get(&tag_id) {
                    resolved_tags.push(tag.clone());
                }
            }

            let language = resolved_tags
                .iter()
                .find(|t| t.r#type == "language")
                .map(|t| t.name.clone())
                .unwrap_or_default();

            let tags = resolved_tags
                .iter()
                .filter(|t| t.r#type == "tag")
                .map(|t| t.name.clone())
                .collect();

            let upload_secs = upload_date_map.get(&item.id).copied().unwrap_or(0);
            let upload_date = if upload_secs > 0 {
                format_upload_date(upload_secs)
            } else {
                "".to_string()
            };

            let english = item.english_title.unwrap_or_default();
            let japanese = item.japanese_title.unwrap_or_default();
            let pretty = if !english.is_empty() {
                english.clone()
            } else {
                japanese.clone()
            };

            NhentaiRelatedParity {
                title: NhentaiTitleParity {
                    english,
                    japanese,
                    pretty,
                },
                id: item.id,
                language,
                upload_date,
                total: item.num_pages,
                tags,
            }
        })
        .collect();

    Ok(json!({
        "success": true,
        "data": content,
        "source": format!("{}/api/v2/galleries/{}/related", NHENTAI_URL, book_id)
    }))
}

pub async fn scrape_random(janda: &JandaPress) -> Result<Value, AppError> {
    let url = format!("{}/api/v2/galleries/random", NHENTAI_URL);
    // Since random shouldn't be cached, fetch directly
    let raw_val = janda.simulate_nhentai_request(&url).await?;
    
    // We want the random gallery id from the returned JSON
    let id = extract_nhentai_id(&raw_val)
        .ok_or_else(|| AppError::ScraperError {
            status: axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            message: "Cannot parse nhentai random gallery id".to_string(),
        })?;

    // Now call scrape_get for this specific id, with random = true logic matching Hono
    let mut get_result = scrape_get(janda, &id.to_string()).await?;
    
    // Adjust source parameter in the JSON matching Hono `scrapeContent` with random parameter
    if let Some(obj) = get_result.as_object_mut() {
        obj.insert("source".to_string(), json!(format!("{}/g/{}", NHENTAI_URL, id)));
    }
    
    Ok(get_result)
}

// --- Private Helper Functions ---

async fn resolve_tag_map(
    janda: &JandaPress,
    items: &[NhentaiV2GallerySummary],
) -> HashMap<i64, NhentaiTag> {
    let mut ids: Vec<i64> = items
        .iter()
        .filter_map(|item| item.tag_ids.clone())
        .flatten()
        .collect();
    
    ids.sort();
    ids.dedup();

    if ids.is_empty() {
        return HashMap::new();
    }

    const CHUNK_SIZE: usize = 80;
    let mut tag_map = HashMap::new();

    for chunk in ids.chunks(CHUNK_SIZE) {
        let chunk_strs: Vec<String> = chunk.iter().map(|id| id.to_string()).collect();
        let endpoint = format!("{}/api/v2/tags/ids?ids={}", NHENTAI_URL, chunk_strs.join(","));

        if let Ok(val) = janda.fetch_json(&endpoint).await {
            if let Ok(tags) = serde_json::from_value::<Vec<NhentaiTag>>(val) {
                for tag in tags {
                    tag_map.insert(tag.id, tag);
                }
            }
        }
    }

    tag_map
}

async fn resolve_upload_date_map(janda: &JandaPress, ids: &[i64]) -> HashMap<i64, i64> {
    let mut upload_date_map = HashMap::new();
    const CHUNK_SIZE: usize = 5;

    // Use Arc to share janda client in spawned threads/futures
    let janda_arc = Arc::new(janda.clone());

    for chunk in ids.chunks(CHUNK_SIZE) {
        let futures = chunk.iter().map(|&id| {
            let janda_clone = Arc::clone(&janda_arc);
            async move {
                let endpoint = format!("{}/api/v2/galleries/{}", NHENTAI_URL, id);
                if let Ok(val) = janda_clone.fetch_json(&endpoint).await {
                    if let Some(upload_date) = val["upload_date"].as_i64() {
                        return Some((id, upload_date));
                    }
                }
                None
            }
        });

        let results = join_all(futures).await;
        for res in results.into_iter().flatten() {
            upload_date_map.insert(res.0, res.1);
        }
    }

    upload_date_map
}

fn extract_nhentai_id(val: &Value) -> Option<i64> {
    if let Some(n) = val.as_i64() {
        return Some(n);
    }
    if let Some(obj) = val.as_object() {
        if let Some(n) = obj.get("id").and_then(|v| v.as_i64()) {
            return Some(n);
        }
        if let Some(n) = obj.get("gallery_id").and_then(|v| v.as_i64()) {
            return Some(n);
        }
        if let Some(n) = obj.get("galleryId").and_then(|v| v.as_i64()) {
            return Some(n);
        }
        for (_, value) in obj {
            if let Some(nested) = extract_nhentai_id(value) {
                return Some(nested);
            }
        }
    }
    None
}
