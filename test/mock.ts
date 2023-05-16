import p from "phin";
import { load } from "cheerio";
import { name, version } from "../package.json";

const url = "https://nhentai.to/g/272";

async function test() {
  const res = await p({
    url: url,
    "headers": {
      "User-Agent": `${name}/${version} Node.js/16.9.1`,
    },
  });
    
  const $ = load(res.body);
  const title = $("title").text();
  console.log(title);
  console.log(res.statusCode);
}

test().catch(console.error);
