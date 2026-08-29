use crate::graphql::schema::JandaSchema;
use async_graphql::http::GraphiQLSource;
use async_graphql_axum::{GraphQLRequest, GraphQLResponse};
use axum::{
    extract::{Query, State},
    response::{Html, IntoResponse},
};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct GraphQLGetQuery {
    pub query: Option<String>,
}

pub async fn graphql_post_handler(
    State(schema): State<JandaSchema>,
    req: GraphQLRequest,
) -> GraphQLResponse {
    schema.execute(req.into_inner()).await.into()
}

pub async fn graphql_get_handler(
    State(schema): State<JandaSchema>,
    Query(query_params): Query<GraphQLGetQuery>,
) -> impl IntoResponse {
    if let Some(q) = query_params.query {
        let request = async_graphql::Request::new(q);
        let response = schema.execute(request).await;
        return GraphQLResponse::from(response).into_response();
    }

    Html(
        GraphiQLSource::build()
            .endpoint("/graphql")
            .finish(),
    )
    .into_response()
}
