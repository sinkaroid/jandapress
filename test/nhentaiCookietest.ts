import p from "phin";
import { CookieJar } from "tough-cookie";
import { HttpsCookieAgent } from "http-cookie-agent/http";
import * as dotenv from "dotenv";

dotenv.config();
const jar = new CookieJar();
jar.setCookie(process.env.COOKIE || "", "https://nhentai.net/");

async function test() {
  const res = await p({
    url: "https://nhentai.net/api/gallery/1",
    core: {
      agent: new HttpsCookieAgent({ cookies: { jar, }, }),
    },
    "headers": {
      "User-Agent": process.env.USER_AGENT || "jandapress/1.0.5 Node.js/16.9.1",
    },
  });
  
  console.log(res.statusCode);
}

test().catch(console.error);