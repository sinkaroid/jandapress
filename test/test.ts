import c from "../src/utils/options";
import p from "phin";
import { name, version } from "../package.json";

function getKeyByValue(data: any, value: string) {
  return Object.keys(data).find(key => data[key] === value);
}

for (const url of
  [
    c.NHENTAI_IP_4,
    c.HENTAIFOX,
    c.PURURIN,
    c.ASMHENTAI,
    c.SIMPLY_HENTAI_PROXIFIED,
    c.HENTAI2READ,
    c.THREEHENTAI
  ]) {
  p({ 
    url: url, 
    headers: {
      "User-Agent": `${name}/${version} Node.js/16.9.1`,
    }
  }).then(res => {
    if (res.statusCode !== 200 && res.statusCode !== 308 && res.statusCode !== 301) {
      throw new Error(`${url} of ${getKeyByValue(c, url)} is not available, status: ${res.statusCode}, couldn't be scrape`);
    }
    else {
      console.log(`${url} is available status: ${res.statusCode}, could be scrape`);
    }
  });
}