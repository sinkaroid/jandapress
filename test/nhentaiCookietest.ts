import p from "phin";
import { CookieJar } from "tough-cookie";
import { HttpsCookieAgent } from "http-cookie-agent/http";
import { config } from "dotenv";
config();

const jar = new CookieJar();
jar.setCookie("cf_clearance=HBMSCcaARc4EO7JkODYxsgfCoxqBX1gxyRswiHL5VZ4-1654510626-0-150", "https://nhentai.net/");

async function test() {
  const res = await p({
    url: "https://nhentai.net/api/galleries/search?query=mother",
    core: {
      agent: new HttpsCookieAgent({ cookies: { jar, }, }),
    },
    "headers": {
      "User-Agent": "jandapress/1.0.5 Node.js/16.9.1" // nhentai-api-client/3.4.3 Node.js/16.9.1
    },
  });
  //check status
  console.log(res.statusCode);
}

test();