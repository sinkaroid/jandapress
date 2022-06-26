import p from "phin";
import { load } from "cheerio";
import c from "./options";


function getPururinInfo(value: string) {
  return value.replace(/\n/g, " ").replace(/\s\s+/g, " ").trim();
}

function getPururinPageCount(value: string) {
  const data = value.replace(/\n/g, " ").replace(/\s\s+/g, " ").trim().split(", ").pop();
  return Number(data?.split(" ")[0]);
}

function getPururinLanguage(value: string) {
  return value.split(",").reverse()[1].trim();
}

function getUrl(url: string) {
  return url.replace(/^\/\//, "https://");
}

function getId(url: string) {
  return url.replace(/^https?:\/\/[^\\/]+/, "").replace(/\/$/, "");
}

function removeNonNumeric(input: string) {
  return input.replace(/[^0-9]/g, "");
}

function getDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

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

export const isNumeric = (val: string) : boolean => {
  return !isNaN(Number(val));
};

export async function getIdRandomPururin (): Promise<number> {
  const randomNumber = Math.floor(Math.random() * 500) + 1;
  const raw = await p(`${c.PURURIN}/browse/random?page=${randomNumber}`);
  const $ = load(raw.body);
  const gallery = $("img.card-img-top").map((i, el) => $(el).attr("data-src")).get();
  const galleryNumber = gallery.map(el => removeNonNumeric(el));
  const randomgallery = galleryNumber[Math.floor(Math.random() * galleryNumber.length)];
  return parseInt(randomgallery);
}

export async function getIdRandomNhentai (): Promise<number> {
  const res: any = await p({
    url: `${c.NHENTAI}/random`,
    followRedirects: true,
  });
  
  const getId = res.socket._httpMessage.path;
  return parseInt(getId.replace(/^\/g\/([0-9]+)\/?$/, "$1"));
}


export { getPururinInfo, getPururinPageCount, getUrl, getId, getDate, timeAgo, 
  mock, getPururinLanguage, removeNonNumeric };