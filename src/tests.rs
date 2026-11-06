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
    async fn test_nhentai_search() {
        let janda = get_test_janda();
        let res = nhentai::scrape_search(&janda, "milf", 1, "date").await;
        if let Ok(val) = res {
            assert_eq!(val["success"], true);
            let items = val["data"].as_array().unwrap();
            assert_eq!(items.len(), 25);
            for item in items {
                assert_eq!(item["upload_date"], "");
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
    async fn test_threehentai_random() {
        let janda = get_test_janda();
        let res = threehentai::scrape_random(&janda).await;
        assert!(res.is_ok(), "3Hentai random failed: {:?}", res.err());
        let val = res.unwrap();
        assert_eq!(val["success"], true);
        assert!(val["data"]["id"].as_i64().unwrap() > 0);
        assert!(!val["data"]["title"].as_str().unwrap().is_empty());
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

    #[tokio::test]
    async fn test_current_process_and_location_cache() {
        let janda = get_test_janda();

        // 1. Process memory formatting
        let (rss, heap) = janda.current_process();
        assert!(rss.ends_with("MB"), "rss should end with MB: {}", rss);
        assert!(heap.ends_with("MB"), "heap should end with MB: {}", heap);

        // 2. Server location caching
        let loc1 = janda.get_server_location().await;
        let loc2 = janda.get_server_location().await;
        assert_eq!(loc1, loc2);
    }

    #[tokio::test]
    async fn test_root_handler_response() {
        let janda = get_test_janda();
        let axum::Json(res) = crate::routes::status::root_handler(axum::extract::State(janda)).await;

        assert_eq!(res["success"], true);
        assert_eq!(res["message"], "Hi, I'm alive!");
        assert!(res["rss"].is_string());
        assert!(res["heap"].is_string());
        assert!(res["server"].is_string());
        assert_eq!(res["version"], env!("CARGO_PKG_VERSION"));
    }

    #[test]
    fn test_hentaifox_real_dom_structure_and_pruning() {
        let real_gallery_html = r#"
        <!DOCTYPE html><html><head><title>Onanie dake nara Daijoubu - HentaiFox</title></head>
        <body>
            <div class="gallery_right">
                <div class="info">
                    <h1>Onanie dake nara Daijoubu</h1>
                </div>
                <div class="gallery_thumb">
                    <img src="//i.hentaifox.com/001/1t.jpg" data-src="//i.hentaifox.com/001/1t.jpg" />
                </div>
                <span class="i_text pages">Pages: 25</span>
                <div class="buttons">
                    <a class="g_button" href="/gallery/59026/">View</a>
                    <a class="tag_btn" href="/tag/futanari/">Futanari <span>123</span></a>
                    <a class="tag_btn" href="/tag/stockings/">Stockings <span>456</span></a>
                </div>
            </div>
            <div id="related">
                <div class="thumb"><a href="/gallery/99999/">Related Manga</a></div>
            </div>
            <footer id="footer">
                <div class="tracker-scripts">Third party ads & trackers</div>
            </footer>
        </body></html>
        "#;

        let pruned = hentaifox::prune_gallery_html(real_gallery_html);
        assert!(pruned.contains("Onanie dake nara Daijoubu"));
        assert!(pruned.contains("href=\"/gallery/59026/\""));
        assert!(pruned.contains("Futanari"));
        assert!(pruned.contains("//i.hentaifox.com/001/1t.jpg"));
        assert!(!pruned.contains("Related Manga"));
        assert!(!pruned.contains("Third party ads & trackers"));

        let real_search_html = r#"
        <!DOCTYPE html><html><body>
            <div class="lc_galleries">
                <div class="thumb">
                    <div class="inner_thumb">
                        <h2 class="g_title"><a href="/gallery/59026/">Onanie dake nara Daijoubu</a></h2>
                        <h3 class="g_cat"><a href="/category/manga/">Manga</a></h3>
                    </div>
                </div>
            </div>
            <div class="pagination">
                <span class="current">1</span>
                <a href="/search/?q=futanari&page=2">2</a>
            </div>
            <footer id="footer">Trackers</footer>
        </body></html>
        "#;

        let pruned_search = hentaifox::prune_search_html(real_search_html);
        assert!(pruned_search.contains("Onanie dake nara Daijoubu"));
        assert!(pruned_search.contains("/category/manga/"));
        assert!(!pruned_search.contains("Trackers"));
    }

    #[test]
    fn test_asmhentai_real_dom_structure_and_pruning() {
        let real_gallery_html = r#"
        <!DOCTYPE html><html><body>
            <div class="cover">
                <a href="/gallery/308830/"><img data-src="//images.asmhentai.com/001/cover.jpg" /></a>
            </div>
            <div class="info">
                <h1>Sample AsmHentai Manga</h1>
                <div class="tags">
                    <span class="badge tag"><a href="/tag/milf/">Milf (50)</a></span>
                </div>
                <div class="pages">
                    <input id="t_pages" value="28" />
                    <h3>Uploaded: 2024-01-01</h3>
                    <div>28 Pages</div>
                </div>
            </div>
            <div id="related">Recommendation Carousel</div>
            <footer id="footer">Footer</footer>
        </body></html>
        "#;

        let pruned = asmhentai::prune_gallery_html(real_gallery_html);
        assert!(pruned.contains("Sample AsmHentai Manga"));
        assert!(pruned.contains("/gallery/308830/"));
        assert!(pruned.contains("value=\"28\""));
        assert!(!pruned.contains("Recommendation Carousel"));

        let real_search_html = r#"
        <!DOCTYPE html><html><body>
            <div class="content">
                <div class="image">
                    <a href="/g/308830/"><img alt="Search Card Result" src="//images.asmhentai.com/001/cover.jpg" /></a>
                </div>
            </div>
            <div class="pagination"><a class="page" href="/search/?q=test&page=2">2</a></div>
            <footer id="footer">Footer</footer>
        </body></html>
        "#;

        let pruned_search = asmhentai::prune_search_html(real_search_html);
        assert!(pruned_search.contains("Search Card Result"));
        assert!(pruned_search.contains("/g/308830/"));
        assert!(!pruned_search.contains("<footer"));
    }

    #[test]
    fn test_threehentai_real_dom_structure_and_pruning() {
        let real_gallery_html = r#"
        <!DOCTYPE html><html><head>
            <link rel="canonical" href="http://3hentai.net/d/608979" />
        </head><body>
            <div class="main-cover">
                <a href="/d/608979"><img src="//3hentai.net/images/608979/cover.jpg" /></a>
            </div>
            <h1>Sample 3Hentai Title</h1>
            <div class="tag-container">
                <span class="filter-elem"><a href="/tag/yuri">yuri</a></span>
            </div>
            <div class="single-thumb-col">
                <img data-src="//3hentai.net/images/608979/1.jpg" />
            </div>
            <time datetime="2024-01-01">2024-01-01</time>
            <div id="related">Related Doujins</div>
            <footer>Site footer</footer>
        </body></html>
        "#;

        let pruned = threehentai::prune_gallery_html(real_gallery_html);
        assert!(pruned.contains("Sample 3Hentai Title"));
        assert!(pruned.contains("http://3hentai.net/d/608979"));
        assert!(pruned.contains("//3hentai.net/images/608979/1.jpg"));
        assert!(!pruned.contains("Related Doujins"));

        let real_search_html = r#"
        <!DOCTYPE html><html><body>
            <div class="doujin">
                <a href="http://3hentai.net/d/608979"><div class="title">Doujin Title In Grid</div></a>
            </div>
            <div class="pagination"><a href="/search?q=test&page=2">2</a></div>
            <footer>Footer</footer>
        </body></html>
        "#;

        let pruned_search = threehentai::prune_search_html(real_search_html);
        assert!(pruned_search.contains("Doujin Title In Grid"));
        assert!(!pruned_search.contains("<footer>Footer</footer>"));
    }

    #[test]
    fn test_pururin_real_dom_structure_and_pruning() {
        let real_gallery_html = r#"
        <!DOCTYPE html><html><head>
            <meta property="og:title" content="Real Pururin Manga" />
            <meta property="og:image" content="https://pururin.me/assets/images/data/47226/cover.jpg" />
            <meta property="og:url" content="https://pururin.me/gallery/47226/sample" />
        </head><body>
            <div class="content-wrapper">
                <span itemprop="numberOfPages">32</span>
                <ul class="list-inline"><li><a href="/tags/1">Milf</a></li></ul>
            </div>
            <div class="related-wrapper">Related section</div>
            <footer>Footer</footer>
        </body></html>
        "#;

        let pruned = pururin::prune_gallery_html(real_gallery_html);
        assert!(pruned.contains("Real Pururin Manga"));
        assert!(pruned.contains("https://pururin.me/gallery/47226/sample"));
        assert!(!pruned.contains("<footer>"));

        let real_search_html = r#"
        <!DOCTYPE html><html><body>
            <div class="card card-gallery">
                <a class="card-img-top" href="/gallery/47226/sample">
                    <img class="card-img-top" alt="Pururin Search Result" src="https://pururin.me/assets/images/data/47226/cover.jpg" />
                </a>
                <div class="info">
                    <a href="/gallery/47226/sample">Pururin Search Result</a>
                    <ul class="list-inline"><li>English</li><li>20 Pages</li></ul>
                </div>
            </div>
            <div class="page-nav"><a href="/search?q=test&page=2">2</a></div>
            <footer>Footer</footer>
        </body></html>
        "#;

        let pruned_search = pururin::prune_search_html(real_search_html);
        assert!(pruned_search.contains("Pururin Search Result"));
        assert!(!pruned_search.contains("<footer>"));
    }
}
