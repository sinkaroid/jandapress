use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub port: u16,
    pub jandapress_graphql: bool,
    pub redis_url: Option<String>,
    pub expire_cache: u64, // In hours
    pub nhentai_api_key: Option<String>,
    pub user_agent: String,
}

fn clean_env_val(val: String) -> String {
    let trimmed = val.trim();
    if (trimmed.starts_with('\'') && trimmed.ends_with('\''))
        || (trimmed.starts_with('"') && trimmed.ends_with('"'))
    {
        if trimmed.len() >= 2 {
            return trimmed[1..trimmed.len() - 1].to_string();
        }
    }
    trimmed.to_string()
}

impl Config {
    pub fn from_env() -> Self {
        // Load .env file if it exists (for local development)
        let _ = dotenvy::dotenv();

        let port = env::var("PORT")
            .ok()
            .map(clean_env_val)
            .and_then(|p| p.parse::<u16>().ok())
            .unwrap_or(3000);

        let jandapress_graphql = env::var("JANDAPRESS_GRAPHQL")
            .ok()
            .map(clean_env_val)
            .map(|val| val.trim().to_lowercase() == "true")
            .unwrap_or(true);

        let redis_url = env::var("REDIS_URL")
            .ok()
            .map(clean_env_val)
            .filter(|s| !s.trim().is_empty());

        let expire_cache = env::var("EXPIRE_CACHE")
            .ok()
            .map(clean_env_val)
            .and_then(|val| val.parse::<u64>().ok())
            .unwrap_or(1);

        let nhentai_api_key = env::var("NHENTAI_API_KEY")
            .ok()
            .map(clean_env_val)
            .filter(|s| !s.trim().is_empty());

        let user_agent = env::var("USER_AGENT")
            .ok()
            .map(clean_env_val)
            .filter(|s| !s.trim().is_empty())
            .unwrap_or_else(|| {
                format!(
                    "jandapress/{} Rust/{}",
                    env!("CARGO_PKG_VERSION"),
                    env!("CARGO_PKG_RUST_VERSION")
                )
            });

        Self {
            port,
            jandapress_graphql,
            redis_url,
            expire_cache,
            nhentai_api_key,
            user_agent,
        }
    }
}
