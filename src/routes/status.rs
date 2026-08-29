use crate::jandapress::JandaPress;
use axum::{extract::State, Json};
use chrono::Local;
use serde_json::{json, Value};

pub async fn root_handler(State(janda): State<JandaPress>) -> Json<Value> {
    let (rss, heap) = janda.current_process();
    let server_location = janda.get_server_location().await;
    let local_time = Local::now().format("%m/%d/%Y, %I:%M:%S %p").to_string(); // Matching local date/time representation

    Json(json!({
        "success": true,
        "message": "Hi, I'm alive!",
        "endpoint": "https://github.com/sinkaroid/jandapress/blob/master/README.md#routing",
        "date": local_time,
        "rss": rss,
        "heap": heap,
        "server": server_location,
        "version": env!("CARGO_PKG_VERSION"),
    }))
}
