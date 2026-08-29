#![recursion_limit = "512"]

mod cache;
mod config;
mod error;
mod graphql;
mod jandapress;
mod logger;
mod metrics;
mod middleware;
mod routes;
mod scraper;
mod utils;
mod tests;

use crate::config::Config;
use crate::graphql::JandaSchema;
use crate::jandapress::JandaPress;
use crate::middleware::{rate_limiter_middleware, slow_down_middleware};
use crate::routes::{doc, redirect, rest, status};
use async_graphql::{EmptyMutation, EmptySubscription, Schema};
use axum::{
    body::Body,
    extract::Request,
    http::StatusCode,
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use serde_json::json;
use std::net::SocketAddr;
use tracing::{info, warn};

async fn not_found_handler(req: Request<Body>) -> impl IntoResponse {
    let path = req.uri().path();
    let method = req.method().as_str();
    let message = format!(
        "The page not found in path {} and method {}",
        path, method
    );
    (
        StatusCode::NOT_FOUND,
        Json(json!({ "message": message })),
    )
}

#[tokio::main]
async fn main() {
    // 1. Initialize Logger
    logger::init();

    // 2. Load Configuration
    let config = Config::from_env();
    info!("Starting Jandapress Version {}", env!("CARGO_PKG_VERSION"));

    // 3. Initialize Custom Prometheus Metrics Collector
    metrics::init_metrics();

    // 4. Create JandaPress Shared State Client
    let janda = JandaPress::new(&config);

    // 4b. Verify Redis connection status asynchronously
    if config.redis_url.is_some() {
        let janda_clone = janda.clone();
        tokio::spawn(async move {
            match janda_clone.cache.test_connection().await {
                Ok(_) => info!("Redis cache connection verified successfully! Backend status: Connected"),
                Err(err) => warn!("Redis connection verification failed: {}. Falling back to In-Memory operations.", err),
            }
        });
    }

    // 5. Build Router groups

    // A. Root status route
    let root_route = Router::<JandaPress>::new()
        .route("/", get(status::root_handler))
        .route_layer(axum::middleware::from_fn_with_state(
            janda.clone(),
            rate_limiter_middleware,
        ))
        .route_layer(axum::middleware::from_fn_with_state(
            janda.clone(),
            slow_down_middleware,
        ));

    // B. Direct Redirect routes (HTTP 301)
    let redirect_routes = Router::<JandaPress>::new()
        .route("/g/{id}", get(redirect::redirect_nhentai))
        .route("/p/{id}", get(redirect::redirect_pururin))
        .route("/h/{id}", get(redirect::redirect_hentaifox))
        .route("/a/{id}", get(redirect::redirect_asmhentai))
        .route_layer(axum::middleware::from_fn_with_state(
            janda.clone(),
            rate_limiter_middleware,
        ))
        .route_layer(axum::middleware::from_fn_with_state(
            janda.clone(),
            slow_down_middleware,
        ));

    // C. REST Scrapers routes (with CORS enabled)
    let scraper_routes = Router::<JandaPress>::new()
        .route("/nhentai/get", get(rest::nhentai_get))
        .route("/nhentai/search", get(rest::nhentai_search))
        .route("/nhentai/related", get(rest::nhentai_related))
        .route("/nhentai/random", get(rest::nhentai_random))
        .route("/pururin/get", get(rest::pururin_get))
        .route("/pururin/search", get(rest::pururin_search))
        .route("/pururin/random", get(rest::pururin_random))
        .route("/hentaifox/get", get(rest::hentaifox_get))
        .route("/hentaifox/search", get(rest::hentaifox_search))
        .route("/hentaifox/random", get(rest::hentaifox_random))
        .route("/asmhentai/get", get(rest::asmhentai_get))
        .route("/asmhentai/search", get(rest::asmhentai_search))
        .route("/asmhentai/random", get(rest::asmhentai_random))
        .route("/hentai2read/get", get(rest::hentai2read_get))
        .route("/hentai2read/search", get(rest::hentai2read_search))
        .route("/simply-hentai/get", get(rest::simply_hentai_get))
        .route("/3hentai/get", get(rest::threehentai_get))
        .route("/3hentai/search", get(rest::threehentai_search))
        .route("/3hentai/random", get(rest::threehentai_random))
        .layer(tower_http::cors::CorsLayer::permissive()) // Permissive CORS exactly matching Honos default enabled CORS
        .route_layer(axum::middleware::from_fn_with_state(
            janda.clone(),
            rate_limiter_middleware,
        ))
        .route_layer(axum::middleware::from_fn_with_state(
            janda.clone(),
            slow_down_middleware,
        ));

    // 7. Assemble final Router
    let mut app = Router::new()
        .merge(root_route.with_state(janda.clone()))
        .merge(redirect_routes.with_state(janda.clone()))
        .merge(scraper_routes.with_state(janda.clone()))
        .route("/metrics", get(metrics::metrics_handler))
        .route("/doc", get(doc::doc_handler))
        .route("/playground", get(doc::playground_handler));

    // 8. Conditional GraphQL Integration
    if config.jandapress_graphql {
        info!("Integrating GraphQL routes (/graphql) with active schema");
        let schema: JandaSchema = Schema::build(
            graphql::Query,
            EmptyMutation,
            EmptySubscription,
        )
        .data(janda.clone())
        .finish();

        app = app.route(
            "/graphql",
            get(graphql::graphql_get_handler)
                .post(graphql::graphql_post_handler)
                .with_state(schema),
        );
    }

    // 9. Add global telemetry and fallback 404
    let app = app
        .layer(axum::middleware::from_fn(metrics::telemetry_middleware))
        .fallback(not_found_handler);

    // 10. Start Server
    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    info!("jandapress is running on port {}", config.port);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
