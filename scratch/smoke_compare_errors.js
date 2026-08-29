const paths = [
  "nhentai/get?book=1111111111111111111111111",
  "nhentai/search?key=trigger_error_to_test",
  "nhentai/search?key=futanari&page=2&sort=trigger_error_to_test",
  "nhentai/related?book=111111111111111111111",
  
  "pururin/get?book=11111111111111111",
  "pururin/search?key=trigger_error_to_test",
  "pururin/search?key=futanari&page=2&sort=trigger_error_to_test",
  
  "hentaifox/get?book=11111111111111111",
  "hentaifox/search?key=trigger_error_to_test",
  "hentaifox/search?key=milf&page=2&sort=trigger_error_to_test",
  
  "asmhentai/get?book=111111111111111",
  "asmhentai/search?key=trigger_error_to_test",
  "asmhentai/search?key=futanari&page=no_number_test",
  
  "hentai2read/get?book=111111111111111",
  "hentai2read/search?key=trigger_error_to_test",
  
  "simply-hentai/get?book=non_valid_url",
  
  "3hentai/get?book=111111111111111",
  "3hentai/search?key=trigger_error_to_test",
  "3hentai/search?key=trigger_error_to_test&page=2&sort=trigger_error_to_test"
];

const jsBase = "https://jandapress.scathach.id";
const rustBase = "http://localhost:3000";

async function run() {
  console.log("=== JANDAPRESS ERROR COMPARISON ===");
  for (const path of paths) {
    console.log(`Path: /${path}`);
    try {
      const jsUrl = `${jsBase}/${path}`;
      const rustUrl = `${rustBase}/${path}`;

      const jsRes = await fetch(jsUrl);
      const rustRes = await fetch(rustUrl);

      const jsStatus = jsRes.status;
      const rustStatus = rustRes.status;

      let jsJson = null;
      let rustJson = null;
      try { jsJson = await jsRes.json(); } catch {}
      try { rustJson = await rustRes.json(); } catch {}

      console.log(`  JS   -> Status: ${jsStatus}, Body: ${JSON.stringify(jsJson)}`);
      console.log(`  Rust -> Status: ${rustStatus}, Body: ${JSON.stringify(rustJson)}`);
    } catch (err) {
      console.error(`  Error querying path /${path}: ${err.message}`);
    }
    console.log("");
  }
}

run();
