import JandaPress from "../JandaPress";
import p from "phin";
import { load } from "cheerio";
import c from "./options";

const janda = new JandaPress();

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
  if (process.env.NHENTAI_IP_ORIGIN === "false") {
    const res: any = await janda.simulateCookie(`${c.NHENTAI}/random`);

    const getId = res.socket._httpMessage.path;
    return parseInt(getId.replace(/^\/g\/([0-9]+)\/?$/, "$1"));
  } else {
    const end = 1234;
    const start = 567890;
    return Math.floor(Math.random() * (end - start + 1)) + start;
  }
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
 * Get nhentai strategy from origin api or simulating the request cookie
 * @returns string
 */
export function nhentaiStrategy() {
  let strategy: string;
  if (process.env.NHENTAI_IP_ORIGIN === "true" || process.env.NHENTAI_IP_ORIGIN === undefined) strategy = c.NHENTAI_IP_4;
  else strategy = c.NHENTAI;
  return strategy;
}

export {
  getPururinInfo, getPururinPageCount, getUrl, getId, getDate, timeAgo,
  mock, getPururinLanguage, removeNonNumeric
};