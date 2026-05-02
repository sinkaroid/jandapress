import Keyv from "keyv";
import KeyvRedis from "@keyv/redis";
import { defaultUserAgent, nhentaiHeaders } from "./utils/modifier";

const keyv = process.env.REDIS_URL
  ? new Keyv({ store: new KeyvRedis(process.env.REDIS_URL) })
  : new Keyv();
  
keyv.on("error", err => console.log("Connection Error", err));
const ttl = 1000 * 60 * 60 * Number(process.env.EXPIRE_CACHE);
const GEO_TIMEOUT_MS = 3000;

let cachedLastLocation: string | null = null;
let lastLocationTimestamp = 0;

function cachedLocationOrUnknown(): string {
  if (cachedLastLocation && lastLocationTimestamp > 0) {
    return cachedLastLocation;
  }
  return "Unknown";
}


class JandaPress {
  url: string;
  useragent: string;
  constructor() {
    this.url = "";
    this.useragent = process.env.USER_AGENT || defaultUserAgent();
  }

  /**
   * Execute nhentai request against official API.
   * @param target url to fetch
   * @returns Promise<unknown>
   * @throws Error
   */
  async simulateNhentaiRequest(target: string): Promise<unknown> {
    try {
      const res = await fetch(target, {
        headers: nhentaiHeaders(),
        redirect: "follow"
      });
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      return await res.json();
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
      const res = await fetch(url, {
        headers: {
          "User-Agent": this.useragent,
        },
        redirect: "follow"
      });
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const body = Buffer.from(await res.arrayBuffer());
      return body;
    } else {
      console.log("Fetching from source");
      const res = await fetch(url, {
        headers: {
          "User-Agent": this.useragent,
        },
        redirect: "follow"
      });
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const body = Buffer.from(await res.arrayBuffer());
      await keyv.set(url, body, ttl);
      return body;
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEO_TIMEOUT_MS);

    try {
      // ip-api free tier often rejects HTTPS requests with 403;
      const raw = await fetch("https://ipwho.is/", {
        signal: controller.signal,
      });
      if (!raw.ok) {
        return cachedLocationOrUnknown();
      }
      const data = await raw.json() as {
        success?: boolean;
        country?: string;
        region?: string;
      };
      if (data.success === false) {
        return cachedLocationOrUnknown();
      }
      const country = data.country?.trim();
      const region = data.region?.trim();
      if (!country || !region) {
        return cachedLocationOrUnknown();
      }

      const location = `${country}, ${region}`;
      cachedLastLocation = location;
      lastLocationTimestamp = Date.now();
      return location;
    } catch {
      return cachedLocationOrUnknown();
    } finally {
      clearTimeout(timeoutId);
      if (!controller.signal.aborted) {
        controller.abort();
      }
    }
    
  }
}

export default JandaPress;
