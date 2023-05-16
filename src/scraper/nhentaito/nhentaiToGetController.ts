import { load } from "cheerio";
import p from "phin";
import JandaPress from "../../JandaPress";
import c from "../../utils/options";
import prox from "../../utils/reverseprox";

interface IGetNhentaiTo {
  title: string;
  id: number;
  tags: string[];
  total: number;
  image: string[];
}

interface IData {
  success: boolean;
  data: object;
  source: string;
}

const janda = new JandaPress();

export async function scrapeContent(url: string, random = false) {
  try {

    let res, raw;
    if (random) res = await p({ 
      url: url,
      headers: {
        "User-Agent": process.env.USER_AGENT || "jandapress/1.0.5 Node.js/16.9.1"
      },
      followRedirects: true
    }), raw = res.body;
    else res = await janda.fetchBody(url), raw = res;

    const $ = load(raw);
    const title: string = $("div#info-block div#info h1").text();
    if (!title) throw Error("Not found");
    const tags: string[] = $("span.tags span.name").map((i, abc) => {
      return $(abc).text();
    }).get();
    // const cover = $("div#cover img").attr("src") || "";
    const total: number = parseInt(tags.pop()?.split(" ")[0] || "0");
    const id: number = parseInt($("div#cover a").attr("href")?.split("/g/")[1] || "0");
    const thumbnail = $("a.gallerythumb img").map((i, abc) => {
      return $(abc).attr("data-src");
    }).get();
    const proxy = thumbnail
      .map((img: string) => img?.replace(prox.NHENTAI_TO, prox.NHENTAI_TO_SOLVER));

    const image = [];
    for (let i = 0; i < total; i++) {
      image.push(`${proxy[i]?.replace("t.", ".")}`);
    }

    const objectData: IGetNhentaiTo = {
      title,
      id,
      tags,
      total,
      image
    };

    const data: IData = {
      success: true,
      data: objectData,
      source: `${c.NHENTAI_TO}/g/${id}?re=janda`
    };
    return data;
   
  } catch (err) {
    const e = err as Error;
    throw Error(e.message);
  }
}