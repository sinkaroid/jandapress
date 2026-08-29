const paths = [
  "nhentai/get?book=577774",
  "nhentai/search?key=futanari",
  "nhentai/search?key=futanari&page=2&sort=popular-today",
  "nhentai/related?book=577774",
  
  "pururin/get?book=63373",
  "pururin/search?key=futanari",
  
  "hentaifox/get?book=97527",
  "hentaifox/search?key=milf",
  "hentaifox/search?key=milf&page=2&sort=latest",
  
  "asmhentai/get?book=416773",
  "asmhentai/search?key=futanari",
  "asmhentai/search?key=futanari&page=2",
  
  "hentai2read/get?book=butabako_shotaone_matome_fgo_hen/1",
  "hentai2read/search?key=futanari",
  
  "simply-hentai/get?book=fate-grand-order/fgo-sanbunkatsuhou/all-pages",
  
  "3hentai/get?book=608979",
  "3hentai/search?key=futanari",
  "3hentai/search?key=futanari&page=2&sort=popular-7d"
];

const jsBase = "https://jandapress.scathach.id";
const rustBase = "http://localhost:3000";

function getType(val) {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  return typeof val;
}

function compareObjects(jsObj, rustObj, path = "") {
  const diffs = [];

  const jsKeys = Object.keys(jsObj || {});
  const rustKeys = Object.keys(rustObj || {});

  // Check key names and key count
  const allKeys = new Set([...jsKeys, ...rustKeys]);
  for (const key of allKeys) {
    const fullPath = path ? `${path}.${key}` : key;
    if (!(key in jsObj)) {
      diffs.push(`[Extra Rust Key]: "${fullPath}" exists in Rust but not in JS`);
      continue;
    }
    if (!(key in rustObj)) {
      diffs.push(`[Missing Rust Key]: "${fullPath}" exists in JS but not in Rust`);
      continue;
    }

    const jsType = getType(jsObj[key]);
    const rustType = getType(rustObj[key]);

    if (jsType !== rustType) {
      diffs.push(`[Type Mismatch]: "${fullPath}" has type "${jsType}" in JS but "${rustType}" in Rust`);
      continue;
    }

    if (jsType === "object") {
      diffs.push(...compareObjects(jsObj[key], rustObj[key], fullPath));
    } else if (jsType === "array") {
      // If it's an array of objects, compare the first element structure
      if (jsObj[key].length > 0 && rustObj[key].length > 0) {
        const itemJsType = getType(jsObj[key][0]);
        const itemRustType = getType(rustObj[key][0]);
        if (itemJsType === "object" && itemRustType === "object") {
          diffs.push(...compareObjects(jsObj[key][0], rustObj[key][0], `${fullPath}[0]`));
        }
      }
    }
  }

  // Check key order
  const commonKeys = jsKeys.filter(k => rustKeys.includes(k));
  const rustCommonKeys = rustKeys.filter(k => jsKeys.includes(k));
  for (let i = 0; i < commonKeys.length; i++) {
    if (commonKeys[i] !== rustCommonKeys[i]) {
      diffs.push(`[Order Mismatch]: Key order differs at index ${i} under "${path || "root"}". JS: "${commonKeys[i]}", Rust: "${rustCommonKeys[i]}"`);
      break; 
    }
  }

  return diffs;
}

async function run() {
  console.log("=== JANDAPRESS SMOKE TEST ===");
  console.log(`JS Base: ${jsBase}`);
  console.log(`Rust Base: ${rustBase}\n`);

  for (const path of paths) {
    console.log(`Testing: /${path}...`);
    try {
      const jsUrl = `${jsBase}/${path}`;
      const rustUrl = `${rustBase}/${path}`;

      const jsRes = await fetch(jsUrl);
      const rustRes = await fetch(rustUrl);

      if (jsRes.status !== 200) {
        console.warn(`  ⚠️ JS endpoint returned status ${jsRes.status}. Skipping comparison.`);
        continue;
      }
      if (rustRes.status !== 200) {
        console.error(`  ❌ Rust endpoint returned status ${rustRes.status}.`);
        continue;
      }

      const jsData = await jsRes.json();
      const rustData = await rustRes.json();

      const diffs = compareObjects(jsData, rustData);
      if (diffs.length === 0) {
        console.log("  ✅ PERFECT 1:1 PARITY (Keys, Types, and Order match exactly)");
      } else {
        console.log(`  ❌ MISMATCHES FOUND (${diffs.length}):`);
        diffs.forEach(d => console.log(`     - ${d}`));
      }
    } catch (err) {
      console.error(`  💥 Exception occurred:`, err.message);
    }
    console.log("");
  }
}

run();
