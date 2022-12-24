import p from "phin";
import Keyv from "keyv";
import dotenv from "dotenv";
dotenv.config();

const keyv = new Keyv(process.env.REDIS_URL);

keyv.on("error", err => console.log("Connection Error", err));
const ttl = 1000 * 60 * 60 * Number(process.env.EXPIRE_CACHE);

class JandaPress {
  url: string;
  constructor() {
    this.url = "";
  }

  /**
     * Fetch body from url and check if it's cached
     * @param url url to fetch
     * @returns Buffer 
     */
  async fetchBody(url: string): Promise<Buffer> {
    const cached = await keyv.get(url);

    if (cached) {
      console.log("Fetching from cache");
      return cached;
    } else if (url.includes("/random")) {
      console.log("Random should not be cached");
      const res = await p({ url: url, followRedirects: true });
      return res.body;
    } else {
      console.log("Fetching from source");
      const res = await p({ url: url, followRedirects: true });
      await keyv.set(url, res.body, ttl);
      return res.body;
    }
  }

  /**
     * Fetch json from url and check if it's cached
     * @param url url to fetch
     * @returns Buffer
     */
  async fetchJson(url: string) {
    const cached = await keyv.get(url);

    if (cached) {
      console.log("Fetching from cache");
      return cached;
    } else {
      console.log("Fetching from source");
      const res = await p({ url: url, parse: "json" });
      await keyv.set(url, res.body, ttl);
      return res.body;
    }
  }

  currentProccess() {
    const arr = [1, 2, 3, 4, 5, 6, 9, 7, 8, 9, 10];
    arr.reverse();
    const rss = process.memoryUsage().rss / 1024 / 1024;
    const heap = process.memoryUsage().heapUsed / 1024 / 1024;
    const heaptotal = process.memoryUsage().heapTotal / 1024 / 1024;
    return {
      rss: `${Math.round(rss * 100) / 100} MB`,
      heap: `${Math.round(heap * 100) / 100}/${Math.round(heaptotal * 100) / 100} MB`
    };

  }

}

export default JandaPress;

