import p, { IResponse } from "phin";
import Keyv from "keyv";
import KeyvRedis from "@keyv/redis";
import { nhentaiHeaders } from "./utils/modifier";

const keyv = process.env.REDIS_URL
  ? new Keyv({ store: new KeyvRedis(process.env.REDIS_URL) })
  : new Keyv();
  
keyv.on("error", err => console.log("Connection Error", err));
const ttl = 1000 * 60 * 60 * Number(process.env.EXPIRE_CACHE);


class JandaPress {
  url: string;
  useragent: string;
  constructor() {
    this.url = "";
    this.useragent = process.env.USER_AGENT || "jandapress/7.1.1-alpha Node.js/22.22.0";
  }

  /**
   * Execute nhentai request against official API.
   * @param target url to fetch
   * @returns Promise<unknown>
   * @throws Error
   */
  async simulateNhentaiRequest(target: string): Promise<unknown> {
    try {
      const res = await p({
        url: target,
        parse: "json",
        headers: nhentaiHeaders(),
        followRedirects: true
      });
      return res.body;
    } catch (err) {
      const e = err as Error;
      throw new Error(e.message);
    }
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
      const res = await p({ 
        url: url, 
        headers: {
          "User-Agent": this.useragent,
        },
        followRedirects: true });
      return res.body;
    } else {
      console.log("Fetching from source");
      const res = await p({ 
        url: url, 
        headers: {
          "User-Agent": this.useragent,
        },
        followRedirects: true 
      });
      await keyv.set(url, res.body, ttl);
      return res.body;
    }
  }

  /**
     * Fetch json from url and check if it's cached
     * @param url url to fetch
     * @returns Buffer
     */
  async fetchJson(url: string): Promise<unknown> {
    const cached = await keyv.get(url);

    if (cached) {
      console.log("Fetching from cache");
      return cached;
    } else {
      console.log("Fetching from source");
      const res = await this.simulateNhentaiRequest(url);
      await keyv.set(url, res, ttl);
      return res;
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

  async getServer(): Promise<string> {
    const raw = await p({ 
      "url": "http://ip-api.com/json", 
      "parse": "json" 
    }) as IResponse;
    const data = raw.body as unknown as { country: string, regionName: string };
    return `${data.country}, ${data.regionName}`;
    
  }
}

export default JandaPress;
