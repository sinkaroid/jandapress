import { load } from "cheerio";
import p from "phin";
import JandaPress from "../../JandaPress";
import c from "../../utils/options";
import { getPururinInfo, getUrl } from "../../utils/modifier";

interface IGetPururin {
  title: string;
  id: number;
  tags: string[];
  extension: string;
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
    if (random) res = await p({ url: url }), raw = res.body;
    else res = await janda.fetchBody(url), raw = res;

    const $ = load(raw);
    
    const title: string = $("meta[property='og:title']").attr("content") || "";
    if (!title) throw Error("Not found");
    
    const tags: string[] = $("div.content-wrapper ul.list-inline li").map((i, abc) => {
      return getPururinInfo($(abc).text());
    }).get();

    const cover = $("meta[property='og:image']").attr("content");
    const extension = `.${cover?.split(".").pop()}`;
    const total: number = parseInt($("span[itemprop='numberOfPages']").text()) || 0;
    const id: number = parseInt($("meta[property='og:url']").attr("content")?.split("/")[4] || "0");

    const image = [];
    for (let i = 0; i < total; i++) {
      image.push(`${getUrl(cover?.replace("cover", `${i + 1}`) ?? "")}`);
    }

    const objectData: IGetPururin = {
      title,
      id,
      tags,
      extension,
      total,
      image
    };

    const data: IData = {
      success: true,
      data: objectData,
      source: `${c.PURURIN}/gallery/${id}/janda`
    };
    return data;
  } catch (err) {
    const e = err as Error;
    throw Error(e.message);
  }
}