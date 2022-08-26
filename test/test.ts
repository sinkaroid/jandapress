import c from "../src/utils/options";
import p from "phin";

for (const url of 
  [c.HENTAIFOX, c.PURURIN, c.HENTAI2READ, c.SIMPLY_HENTAI, 
    c.SIMPLY_HENTAI_PROXIFIED, c.NHENTAI, c.NHENTAI_IP_3, c.ASMHENTAI]) {
  p({ url }).then(res => {
    if (res.statusCode !== 200) {
      console.log(`${url} is not available, status code: ${res.statusCode}`);
    }
    else {
      console.log(`${url} is available, can be scraped`);
    }
  });
}