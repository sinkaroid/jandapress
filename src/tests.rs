#[cfg(test)]
mod tests {
    use crate::config::Config;
    use crate::jandapress::JandaPress;
    use crate::scraper::{
        asmhentai, hentai2read, hentaifox, nhentai, pururin, simply_hentai, threehentai,
    };

    fn get_test_janda() -> JandaPress {
        let config = Config::from_env();
        JandaPress::new(&config)
    }

    #[test]
    fn test_config_loaded() {
        let config = Config::from_env();
        println!("Loaded config: {:?}", config);
        
        if let Some(ref key) = config.nhentai_api_key {
            assert!(!key.starts_with('\'') && !key.ends_with('\''));
            assert!(key.starts_with("nhk_"));
        }
        
        if let Some(ref redis) = config.redis_url {
            assert!(!redis.starts_with('\'') && !redis.ends_with('\''));
            assert!(redis.starts_with("redis://"));
        }
        
        assert_eq!(config.expire_cache, 1);
    }

    #[tokio::test]
    async fn test_nhentai_scraper() {
        let janda = get_test_janda();
        let res = nhentai::scrape_get(&janda, "577774").await;
        match res {
            Ok(val) => {
                assert_eq!(val["success"], true);
                assert_eq!(val["data"]["id"], 577774);
                assert!(!val["data"]["image"].as_array().unwrap().is_empty());
            }
            Err(e) => {
                println!("NHentai scraper was blocked or returned error (expected if without API Key): {:?}", e);
            }
        }
    }

    #[tokio::test]
    async fn test_pururin_scraper() {
        let janda = get_test_janda();
        let res = pururin::scrape_get(&janda, "47226").await;
        assert!(res.is_ok(), "Pururin get failed: {:?}", res.err());
        let val = res.unwrap();
        assert_eq!(val["success"], true);
        assert_eq!(val["data"]["id"], 47226);
        assert!(!val["data"]["image"].as_array().unwrap().is_empty());
    }

    #[tokio::test]
    async fn test_hentaifox_scraper() {
        let janda = get_test_janda();
        let res = hentaifox::scrape_get(&janda, "59026").await;
        assert!(res.is_ok(), "Hentaifox get failed: {:?}", res.err());
        let val = res.unwrap();
        assert_eq!(val["success"], true);
        assert_eq!(val["data"]["id"], 59026);
        assert!(!val["data"]["image"].as_array().unwrap().is_empty());
    }

    #[tokio::test]
    async fn test_asmhentai_scraper() {
        let janda = get_test_janda();
        let res = asmhentai::scrape_get(&janda, "308830").await;
        assert!(res.is_ok(), "Asmhentai get failed: {:?}", res.err());
        let val = res.unwrap();
        assert_eq!(val["success"], true);
        assert_eq!(val["data"]["id"], 308830);
        assert!(!val["data"]["image"].as_array().unwrap().is_empty());
    }

    #[tokio::test]
    async fn test_hentai2read_scraper() {
        let janda = get_test_janda();
        let slug = "butabako_shotaone_matome_fgo_hen/1";
        let res = hentai2read::scrape_get(&janda, slug).await;
        match res {
            Ok(val) => {
                assert_eq!(val["success"], true);
                assert!(!val["data"]["image"].as_array().unwrap().is_empty());
            }
            Err(e) => {
                println!("Hentai2read scraper was blocked or returned error (expected under Cloudflare challenge): {:?}", e);
            }
        }
    }

    #[tokio::test]
    async fn test_simply_hentai_scraper() {
        let janda = get_test_janda();
        let slug = "fate-grand-order/fgo-sanbunkatsuhou/all-pages";
        let res = simply_hentai::scrape_get(&janda, slug).await;
        match res {
            Ok(val) => {
                assert_eq!(val["success"], true);
                assert!(!val["data"]["image"].as_array().unwrap().is_empty());
            }
            Err(e) => {
                println!("Simply Hentai scraper was blocked or returned error (expected under Cloudflare challenge): {:?}", e);
            }
        }
    }

    #[tokio::test]
    async fn test_threehentai_scraper() {
        let janda = get_test_janda();
        let res = threehentai::scrape_get(&janda, "608979").await;
        assert!(res.is_ok(), "3Hentai get failed: {:?}", res.err());
        let val = res.unwrap();
        assert_eq!(val["success"], true);
        assert_eq!(val["data"]["id"], 608979);
        assert!(!val["data"]["image"].as_array().unwrap().is_empty());
    }

    #[tokio::test]
    async fn test_redis_connection_direct() {
        let _ = crate::logger::init();
        let config = Config::from_env();
        let janda = JandaPress::new(&config);
        
        let test_key = "jandapress_test_key";
        let test_val = b"hello_redis".to_vec();
        
        janda.cache.set(test_key, &test_val).await;
        
        // Wait a tiny bit for it to resolve (since Redis set is async in set calls)
        tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
        
        let retrieved = janda.cache.get(test_key).await;
        assert_eq!(retrieved, Some(test_val));
    }
}
