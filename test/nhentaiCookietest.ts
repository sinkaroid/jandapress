import p from "phin";
import { CookieJar } from "tough-cookie";
import { HttpsCookieAgent } from "http-cookie-agent/http";
import { config } from "dotenv";
import * as pkg from "../package.json";
config();

const jar = new CookieJar();
jar.setCookie(process.env.CF as string, "https://nhentai.net/");

async function test(): Promise<void> {
  const res = await p({
    url: "https://nhentai.net/api/galleries/search?query=futanari",
    core: {
      agent: new HttpsCookieAgent({ cookies: { jar, }, }),
    },
    "headers": {
      "User-Agent": `${pkg.name}/${pkg.version} Node.js/16.9.1`
    },
  });
  console.log(res.statusCode);
}

test();