use crate::error::AppError;
use crate::utils::is_numeric;
use axum::{
    extract::Path,
    http::{header::LOCATION, StatusCode},
    response::{IntoResponse, Response},
};

pub async fn redirect_nhentai(Path(id): Path<String>) -> Result<Response, AppError> {
    if !is_numeric(&id) {
        return Err(AppError::MessageError {
            status: StatusCode::BAD_REQUEST,
            message: "This path need required number to work".to_string(),
        });
    }
    let target = format!("https://nhentai.net/g/{}", id);
    Ok((StatusCode::MOVED_PERMANENTLY, [(LOCATION, target)]).into_response())
}

pub async fn redirect_pururin(Path(id): Path<String>) -> Result<Response, AppError> {
    if !is_numeric(&id) {
        return Err(AppError::MessageError {
            status: StatusCode::BAD_REQUEST,
            message: "This path need required number to work".to_string(),
        });
    }
    let target = format!("https://pururin.to/gallery/{}/re=janda", id);
    Ok((StatusCode::MOVED_PERMANENTLY, [(LOCATION, target)]).into_response())
}

pub async fn redirect_hentaifox(Path(id): Path<String>) -> Result<Response, AppError> {
    if !is_numeric(&id) {
        return Err(AppError::MessageError {
            status: StatusCode::BAD_REQUEST,
            message: "This path need required number to work".to_string(),
        });
    }
    let target = format!("https://hentaifox.com/gallery/{}", id);
    Ok((StatusCode::MOVED_PERMANENTLY, [(LOCATION, target)]).into_response())
}

pub async fn redirect_asmhentai(Path(id): Path<String>) -> Result<Response, AppError> {
    if !is_numeric(&id) {
        return Err(AppError::MessageError {
            status: StatusCode::BAD_REQUEST,
            message: "This path need required number to work".to_string(),
        });
    }
    let target = format!("https://asmhentai.com/g/{}", id);
    Ok((StatusCode::MOVED_PERMANENTLY, [(LOCATION, target)]).into_response())
}
