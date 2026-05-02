import { load } from "cheerio";
import c from "./options";
import { nhentaiRandomUrl } from "./nhentai";
import * as pkg from "../../package.json";

function runtimeBunVersion(): string {
  const bunFromGlobal = (globalThis as { Bun?: { version?: string } }).Bun?.version;
  return bunFromGlobal ?? process.versions.bun ?? "unknown";
}

export function defaultUserAgent(): string {
  return `${pkg.name}/${pkg.version} Bun/${runtimeBunVersion()}`;
}

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
  const formatter = new Intl.RelativeTimeFormat("en");
  const ranges: Partial<Record<Intl.RelativeTimeFormatUnit, number>> = {
    years: 3600 * 24 * 365,
    months: 3600 * 24 * 30,
    weeks: 3600 * 24 * 7,
    days: 3600 * 24,
    hours: 3600,
    minutes: 60,
    seconds: 1
  };
  const secondsElapsed = (date.getTime() - Date.now()) / 1000;
  for (const key of Object.keys(ranges) as Intl.RelativeTimeFormatUnit[]) {
    const seconds = ranges[key];
    if (!seconds) continue;
    if (seconds < Math.abs(secondsElapsed)) {
      const delta = secondsElapsed / seconds;
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
  const site = await fetch(url, { redirect: "follow" });
  if (site.status === 200) {
    return true;
  } else if (site.status === 308) {
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
  const raw = await fetch(`${c.PURURIN}/browse?sort=newest&page=${randomNumber}`);
  const html = await raw.text();
  const $ = load(html);
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
  const res = await fetch(nhentaiRandomUrl(), {
    headers: nhentaiHeaders(),
    redirect: "follow"
  });

  const body = await res.json() as Record<string, unknown>;
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
export function nhentaiHeaders(): Record<string, string> {
  const key = process.env.NHENTAI_API_KEY?.trim();
  const userAgent = process.env.USER_AGENT || defaultUserAgent();
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
    const res = await fetch(jpgUrl, { method: "HEAD", redirect: "follow" });

    if (res.status === 200) {
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
