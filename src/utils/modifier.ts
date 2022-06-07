import p from "phin";
import { CookieJar } from "tough-cookie";
import { HttpsCookieAgent } from "http-cookie-agent/http";
import { config } from "dotenv";
import * as pkg from "../../package.json";
config();

const jar = new CookieJar();
jar.setCookie(process.env.CF as string, "https://nhentai.net/");

async function nhentaiStatus(): Promise<boolean> {
  const res = await p({
    url: "https://nhentai.net/api/galleries/search?query=futanari",
    core: {
      agent: new HttpsCookieAgent({ cookies: { jar, }, }),
    },
    "headers": {
      "User-Agent": `${pkg.name}/${pkg.version} Node.js/16.9.1`
    },
  });
  if (res.statusCode === 200) {
    return true;
  } else {
    return false;
  }
}

function getPururinInfo(value: string) {
  return value.replace(/\n/g, " ").replace(/\s\s+/g, " ").trim();
}

function getPururinPageCount(value: string) {
  const data = value.replace(/\n/g, " ").replace(/\s\s+/g, " ").trim().split(", ").pop();
  return Number(data?.split(" ")[0]);
}

function getUrl(url: string) {
  return url.replace(/^\/\//, "https://");
}

function getId(url: string) {
  return url.replace(/^https?:\/\/[^\\/]+/, "").replace(/\/$/, "");
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


export { getPururinInfo, getPururinPageCount, getUrl, getId, getDate, timeAgo, mock, nhentaiStatus };