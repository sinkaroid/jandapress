import p from "phin";
import { load } from "cheerio";
import c from "./options";
import { IncomingHttpHeaders } from "http";
import { nhentaiRandomUrl } from "./nhentai";

/**
 * Get Pururin info and replace
 * @param value 
 * @returns string
 */
function getPururinInfo(value: string) {
  return value.replace(/\n/g, " ").replace(/\s\s+/g, " ").trim();
}

/**
 * Get Pururin page count
 * @param value
 * @returns number
 */
function getPururinPageCount(value: string) {
  const data = value.replace(/\n/g, " ").replace(/\s\s+/g, " ").trim().split(", ").pop();
  return Number(data?.split(" ")[0]);
}

/**
 * Get Pururin language
 * @param value
 * @returns string
 */
function getPururinLanguage(value: string) {
  return value.split(",").reverse()[1].trim();
}

/**
 * Parse url
 * @param url
 * @returns string
 */
function getUrl(url: string) {
  return url.replace(/^\/\//, "https://");
}

/**
 * Parse id
 * @param url
 * @returns string
 */
function getId(url: string) {
  return url.replace(/^https?:\/\/[^\\/]+/, "").replace(/\/$/, "");
}

/**
 * Parse alphabet only
 * @param input
 * @returns string
 */
function removeNonNumeric(input: string) {
  return input.replace(/[^0-9]/g, "");
}

/**
 * Parse date format on nhentai
 * @param date
 * @returns string
 */
function getDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Fancy time ago format
 * @param input 
 * @returns string
 */
function timeAgo(input: Date) {
  const date = new Date(input);
  const formatter: any = new Intl.RelativeTimeFormat("en");
  const ranges: { [key: string]: number } = {
    years: 3600 * 24 * 365,
    months: 3600 * 24 * 30,
    weeks: 3600 * 24 * 7,
    days: 3600 * 24,
    hours: 3600,
    minutes: 60,
    seconds: 1
  };
  const secondsElapsed = (date.getTime() - Date.now()) / 1000;
  for (const key in ranges) {
    if (ranges[key] < Math.abs(secondsElapsed)) {
      const delta = secondsElapsed / ranges[key];
      return formatter.format(Math.round(delta), key);
    }
  }
}

/**
 * Check nhentai status
 * @param url
 * @returns boolean
 */
async function mock(url: string) {
  const site = await p({ url: url });
  if (site.statusCode === 200) {
    return true;
  } else if (site.statusCode === 308) {
    return true;
  } else {
    return false;
  }
}

/** 
 * Check if string is numeric
 * @param val
 * @returns boolean
 */
export const isNumeric = (val: string): boolean => {
  return !isNaN(Number(val));
};

/** 
 * Simulate random on pururin
 * @returns Promise<number>
 */
export async function getIdRandomPururin(): Promise<number> {
  const randomNumber = Math.floor(Math.random() * 500) + 1;
  const raw = await p(`${c.PURURIN}/browse?sort=newest&page=${randomNumber}`);
  const $ = load(raw.body);
  const gallery = $(".card.card-gallery").map((i, el) => $(el).attr("href")).get();
  const galleryNumber = gallery.map(el => removeNonNumeric(el));
  const randomgallery = galleryNumber[Math.floor(Math.random() * galleryNumber.length)];
  return parseInt(randomgallery);
}

/**
 * Simulate random on nhentai
 * @returns Promise<number>
 */

export async function getIdRandomNhentai(): Promise<number> {
  const res = await p({
    url: nhentaiRandomUrl(),
    parse: "json",
    headers: nhentaiHeaders(),
    timeout: 10000
  });

  const body = res.body as Record<string, unknown>;
  const id = extractNhentaiId(body);

  if (!id) {
    throw Error("Cannot parse nhentai random gallery id");
  }

  return id;
}

/**
 * Error handler
 * @param success
 * @param message
 * @returns object
 */
export function maybeError(success: boolean, message: string) {
  return { success, message };
}

/**
 * Common headers for nhentai official API.
 * Uses API key when provided in env.
 */
export function nhentaiHeaders(): IncomingHttpHeaders {
  const key = process.env.NHENTAI_API_KEY?.trim();
  const userAgent = process.env.USER_AGENT || "jandapress/7.1.1-alpha Node.js/22.22.0";
  const maskedKey = key ? `${key.slice(0, 6)}...(${key.length})` : "none";

  console.log(`[nhentai] headers ready | apiKey=${maskedKey} | auth=${key ? "Bearer" : "none"} | ua=${userAgent}`);

  return {
    "User-Agent": userAgent,
    ...(key ? { Authorization: `Bearer ${key}` } : {}),
  };
}

function extractNhentaiId(input: unknown): number | null {
  if (typeof input === "number" && Number.isFinite(input)) return input;

  if (input && typeof input === "object") {
    const rec = input as Record<string, unknown>;
    const direct = rec.id ?? rec.gallery_id ?? rec.galleryId;

    if (typeof direct === "number" && Number.isFinite(direct)) return direct;

    for (const value of Object.values(rec)) {
      const nested = extractNhentaiId(value);
      if (nested) return nested;
    }
  }

  return null;
}

/**
 * Predict the extension of hentaiFox images
 * @param url 
 * @returns Promise<".jpg" | ".webp"> lolz
 */
export async function hentaiFoxPredictedExtension(url: string): Promise<".jpg" | ".webp"> {
  try {
    const jpgUrl = url;
    const res = await p({ url: jpgUrl, method: "HEAD", followRedirects: true });

    if (res.statusCode === 200) {
      return ".jpg";
    } else {
      return ".webp";
    }
  } catch (err) {
    const e = err as Error;
    console.log(e.message);
    return ".webp";
  }
}

export {
  getPururinInfo, getPururinPageCount, getUrl, getId, getDate, timeAgo,
  mock, getPururinLanguage, removeNonNumeric
};
