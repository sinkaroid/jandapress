use crate::jandapress::JandaPress;
use crate::scraper::{
    asmhentai, hentai2read, hentaifox, nhentai, pururin, simply_hentai, threehentai,
};
use async_graphql::{Context, Object, Schema, SimpleObject};
use serde::Deserialize;

// --- GraphQL Schema Type Mappings ---

// --- nhentai ---
#[derive(SimpleObject, Deserialize, Clone)]
pub struct NHentaiTitle {
    pub english: String,
    pub japanese: String,
    pub pretty: String,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct NHentaiGetData {
    pub title: String,
    pub optional_title: NHentaiTitle,
    pub id: i64,
    pub language: String,
    pub tags: Vec<String>,
    pub total: i32,
    pub image: Vec<String>,
    pub num_pages: i32,
    pub num_favorites: i32,
    pub artist: Vec<String>,
    pub group: String,
    pub parodies: Vec<String>,
    pub characters: Vec<String>,
    pub upload_date: String,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct NHentaiGetResult {
    pub success: bool,
    pub data: NHentaiGetData,
    pub source: String,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct NHentaiSearchData {
    pub title: NHentaiTitle,
    pub id: i64,
    pub language: String,
    pub upload_date: String,
    pub total: i32,
    pub cover: String,
    pub tags: Vec<String>,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct NHentaiSearchResult {
    pub success: bool,
    pub data: Vec<NHentaiSearchData>,
    pub page: i32,
    pub sort: String,
    pub source: String,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct NHentaiRelatedData {
    pub title: NHentaiTitle,
    pub id: i64,
    pub language: String,
    pub upload_date: String,
    pub total: i32,
    pub tags: Vec<String>,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct NHentaiRelatedResult {
    pub success: bool,
    pub data: Vec<NHentaiRelatedData>,
    pub source: String,
}

// --- pururin ---
#[derive(SimpleObject, Deserialize, Clone)]
pub struct PururinGetData {
    pub title: String,
    pub id: i64,
    pub tags: Vec<String>,
    pub extension: String,
    pub total: i32,
    pub image: Vec<String>,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct PururinGetResult {
    pub success: bool,
    pub data: PururinGetData,
    pub source: String,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct PururinSearchData {
    pub title: String,
    pub cover: Option<String>,
    pub id: i64,
    pub language: String,
    pub info: String,
    pub link: String,
    pub total: i32,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct PururinSearchResult {
    pub success: bool,
    pub data: Vec<PururinSearchData>,
    pub page: i32,
    pub sort: Option<String>,
    pub source: String,
}

// --- hentaifox ---
#[derive(SimpleObject, Deserialize, Clone)]
pub struct HentaifoxGetData {
    pub title: String,
    pub id: i64,
    pub tags: Vec<String>,
    pub r#type: String,
    pub total: i32,
    pub image: Vec<String>,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct HentaifoxGetResult {
    pub success: bool,
    pub data: HentaifoxGetData,
    pub source: String,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct HentaifoxSearchData {
    pub title: String,
    pub cover: String,
    pub id: i64,
    pub language: String,
    pub category: String,
    pub link: String,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct HentaifoxSearchResult {
    pub success: bool,
    pub data: Vec<HentaifoxSearchData>,
    pub page: i32,
    pub sort: String,
    pub source: String,
}

// --- asmhentai ---
#[derive(SimpleObject, Deserialize, Clone)]
pub struct AsmhentaiGetData {
    pub title: String,
    pub id: i64,
    pub tags: Vec<String>,
    pub total: i32,
    pub image: Vec<String>,
    pub upload_date: String,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct AsmhentaiGetResult {
    pub success: bool,
    pub data: AsmhentaiGetData,
    pub source: String,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct AsmhentaiSearchData {
    pub title: String,
    pub id: i64,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct AsmhentaiSearchResult {
    pub success: bool,
    pub data: Vec<AsmhentaiSearchData>,
    pub page: i32,
    pub sort: String,
    pub source: String,
}

// --- hentai2read ---
#[derive(SimpleObject, Deserialize, Clone)]
pub struct Hentai2readGetData {
    pub title: String,
    pub id: String,
    pub image: Vec<String>,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct Hentai2readGetResult {
    pub success: bool,
    pub data: Hentai2readGetData,
    pub main_url: String,
    pub current_url: String,
    pub next_url: Option<String>,
    pub previus_url: Option<String>,
    pub source: String,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct Hentai2readSearchData {
    pub title: String,
    pub cover: String,
    pub id: String,
    pub link: String,
    pub message: String,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct Hentai2readSearchResult {
    pub data: Vec<Hentai2readSearchData>,
    pub source: String,
}

// --- simply-hentai ---
#[derive(SimpleObject, Deserialize, Clone)]
pub struct SimplyHentaiGetData {
    pub title: String,
    pub id: String,
    pub tags: Vec<String>,
    pub total: i32,
    pub image: Vec<String>,
    pub language: String,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct SimplyHentaiGetResult {
    pub success: bool,
    pub data: SimplyHentaiGetData,
    pub source: String,
}

// --- 3hentai ---
#[derive(SimpleObject, Deserialize, Clone)]
pub struct ThreehentaiGetData {
    pub title: String,
    pub id: i64,
    pub tags: Vec<String>,
    pub total: i32,
    pub image: Vec<String>,
    pub upload_date: String,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct ThreehentaiGetResult {
    pub success: bool,
    pub data: ThreehentaiGetData,
    pub source: String,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct ThreehentaiSearchData {
    pub title: String,
    pub id: i64,
}

#[derive(SimpleObject, Deserialize, Clone)]
pub struct ThreehentaiSearchResult {
    pub success: bool,
    pub data: Vec<ThreehentaiSearchData>,
    pub page: i32,
    pub sort: String,
    pub source: String,
}

// --- GraphQL Resolver Sub-Objects ---

pub struct NhentaiQueries;

#[Object]
impl NhentaiQueries {
    async fn get(&self, ctx: &Context<'_>, book: i32) -> Result<NHentaiGetResult, async_graphql::Error> {
        let janda = ctx.data::<JandaPress>()?;
        let val = nhentai::scrape_get(janda, &book.to_string()).await?;
        let res = serde_json::from_value(val)?;
        Ok(res)
    }

    async fn search(
        &self,
        ctx: &Context<'_>,
        key: String,
        #[graphql(default = 1)] page: i32,
        #[graphql(default = "date")] sort: String,
    ) -> Result<NHentaiSearchResult, async_graphql::Error> {
        let janda = ctx.data::<JandaPress>()?;
        let val = nhentai::scrape_search(janda, &key, page as u32, &sort).await?;
        let res = serde_json::from_value(val)?;
        Ok(res)
    }

    async fn random(&self, ctx: &Context<'_>) -> Result<NHentaiGetResult, async_graphql::Error> {
        let janda = ctx.data::<JandaPress>()?;
        let val = nhentai::scrape_random(janda).await?;
        let res = serde_json::from_value(val)?;
        Ok(res)
    }

    async fn related(&self, ctx: &Context<'_>, book: i32) -> Result<NHentaiRelatedResult, async_graphql::Error> {
        let janda = ctx.data::<JandaPress>()?;
        let val = nhentai::scrape_related(janda, &book.to_string()).await?;
        let res = serde_json::from_value(val)?;
        Ok(res)
    }
}

pub struct PururinQueries;

#[Object]
impl PururinQueries {
    async fn get(&self, ctx: &Context<'_>, book: i32) -> Result<PururinGetResult, async_graphql::Error> {
        let janda = ctx.data::<JandaPress>()?;
        let val = pururin::scrape_get(janda, &book.to_string()).await?;
        let res = serde_json::from_value(val)?;
        Ok(res)
    }

    async fn search(
        &self,
        ctx: &Context<'_>,
        key: String,
        #[graphql(default = 1)] page: i32,
    ) -> Result<PururinSearchResult, async_graphql::Error> {
        let janda = ctx.data::<JandaPress>()?;
        let val = pururin::scrape_search(janda, &key, page as u32).await?;
        let res = serde_json::from_value(val)?;
        Ok(res)
    }

    async fn random(&self, ctx: &Context<'_>) -> Result<PururinGetResult, async_graphql::Error> {
        let janda = ctx.data::<JandaPress>()?;
        let val = pururin::scrape_random(janda).await?;
        let res = serde_json::from_value(val)?;
        Ok(res)
    }
}

pub struct HentaifoxQueries;

#[Object]
impl HentaifoxQueries {
    async fn get(&self, ctx: &Context<'_>, book: i32) -> Result<HentaifoxGetResult, async_graphql::Error> {
        let janda = ctx.data::<JandaPress>()?;
        let val = hentaifox::scrape_get(janda, &book.to_string()).await?;
        let res = serde_json::from_value(val)?;
        Ok(res)
    }

    async fn search(
        &self,
        ctx: &Context<'_>,
        key: String,
        #[graphql(default = 1)] page: i32,
        #[graphql(default = "latest")] sort: String,
    ) -> Result<HentaifoxSearchResult, async_graphql::Error> {
        let janda = ctx.data::<JandaPress>()?;
        let val = hentaifox::scrape_search(janda, &key, page as u32, &sort).await?;
        let res = serde_json::from_value(val)?;
        Ok(res)
    }

    async fn random(&self, ctx: &Context<'_>) -> Result<HentaifoxGetResult, async_graphql::Error> {
        let janda = ctx.data::<JandaPress>()?;
        let val = hentaifox::scrape_random(janda).await?;
        let res = serde_json::from_value(val)?;
        Ok(res)
    }
}

pub struct AsmhentaiQueries;

#[Object]
impl AsmhentaiQueries {
    async fn get(&self, ctx: &Context<'_>, book: i32) -> Result<AsmhentaiGetResult, async_graphql::Error> {
        let janda = ctx.data::<JandaPress>()?;
        let val = asmhentai::scrape_get(janda, &book.to_string()).await?;
        let res = serde_json::from_value(val)?;
        Ok(res)
    }

    async fn search(
        &self,
        ctx: &Context<'_>,
        key: String,
        #[graphql(default = 1)] page: i32,
    ) -> Result<AsmhentaiSearchResult, async_graphql::Error> {
        let janda = ctx.data::<JandaPress>()?;
        let val = asmhentai::scrape_search(janda, &key, page as u32).await?;
        let res = serde_json::from_value(val)?;
        Ok(res)
    }

    async fn random(&self, ctx: &Context<'_>) -> Result<AsmhentaiGetResult, async_graphql::Error> {
        let janda = ctx.data::<JandaPress>()?;
        let val = asmhentai::scrape_random(janda).await?;
        let res = serde_json::from_value(val)?;
        Ok(res)
    }
}

pub struct Hentai2readQueries;

#[Object]
impl Hentai2readQueries {
    async fn get(&self, ctx: &Context<'_>, book: String) -> Result<Hentai2readGetResult, async_graphql::Error> {
        let janda = ctx.data::<JandaPress>()?;
        let val = hentai2read::scrape_get(janda, &book).await?;
        let res = serde_json::from_value(val)?;
        Ok(res)
    }

    async fn search(
        &self,
        ctx: &Context<'_>,
        key: String,
        #[graphql(default = 1)] _page: i32, // matching parameter mapping
    ) -> Result<Hentai2readSearchResult, async_graphql::Error> {
        let janda = ctx.data::<JandaPress>()?;
        let val = hentai2read::scrape_search(janda, &key).await?;
        let res = serde_json::from_value(val)?;
        Ok(res)
    }
}

pub struct SimplyHentaiQueries;

#[Object]
impl SimplyHentaiQueries {
    async fn get(&self, ctx: &Context<'_>, book: String) -> Result<SimplyHentaiGetResult, async_graphql::Error> {
        let janda = ctx.data::<JandaPress>()?;
        let val = simply_hentai::scrape_get(janda, &book).await?;
        let res = serde_json::from_value(val)?;
        Ok(res)
    }
}

pub struct ThreehentaiQueries;

#[Object]
impl ThreehentaiQueries {
    async fn get(&self, ctx: &Context<'_>, book: i32) -> Result<ThreehentaiGetResult, async_graphql::Error> {
        let janda = ctx.data::<JandaPress>()?;
        let val = threehentai::scrape_get(janda, &book.to_string()).await?;
        let res = serde_json::from_value(val)?;
        Ok(res)
    }

    async fn search(
        &self,
        ctx: &Context<'_>,
        key: String,
        #[graphql(default = 1)] page: i32,
        #[graphql(default = "recent")] sort: String,
    ) -> Result<ThreehentaiSearchResult, async_graphql::Error> {
        let janda = ctx.data::<JandaPress>()?;
        let val = threehentai::scrape_search(janda, &key, page as u32, &sort).await?;
        let res = serde_json::from_value(val)?;
        Ok(res)
    }

    async fn random(&self, ctx: &Context<'_>) -> Result<ThreehentaiGetResult, async_graphql::Error> {
        let janda = ctx.data::<JandaPress>()?;
        let val = threehentai::scrape_random(janda).await?;
        let res = serde_json::from_value(val)?;
        Ok(res)
    }
}

// --- Root Schema ---

pub struct Query;

#[Object]
impl Query {
    async fn nhentai(&self) -> NhentaiQueries {
        NhentaiQueries
    }

    async fn pururin(&self) -> PururinQueries {
        PururinQueries
    }

    async fn hentaifox(&self) -> HentaifoxQueries {
        HentaifoxQueries
    }

    async fn asmhentai(&self) -> AsmhentaiQueries {
        AsmhentaiQueries
    }

    async fn hentai2read(&self) -> Hentai2readQueries {
        Hentai2readQueries
    }

    #[graphql(name = "simplyHentai")]
    async fn simply_hentai(&self) -> SimplyHentaiQueries {
        SimplyHentaiQueries
    }

    #[graphql(name = "threehentai")]
    async fn threehentai(&self) -> ThreehentaiQueries {
        ThreehentaiQueries
    }
}

pub type JandaSchema = Schema<Query, async_graphql::EmptyMutation, async_graphql::EmptySubscription>;
