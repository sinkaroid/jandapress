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

interface IData{
  data: object;
  source: string;
}

const janda = new JandaPress();

export async function scrapeContent(url: string, random: boolean = false) {
  try {
    let res, raw
    if (random) res = await p({ url: url }), raw = res.body;
    else res = await janda.fetchBody(url), raw = res;

    const $ = load(raw);
    const title: string = $("div.content-wrapper h1").html() || "";
    
    const tags: string[] = $("div.content-wrapper ul.list-inline li").map((i, abc) => {
      return getPururinInfo($(abc).text());
    }).get();

    const cover = $("meta[property='og:image']").attr("content");
    const extension = `.${cover?.split(".").pop()}`;
    const total: number = parseInt($("gallery-thumbnails").attr(":total") || "0");
    const id: number = parseInt($("gallery-thumbnails").attr(":id") || "0");

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
      data: objectData,
      source: `${c.PURURIN}/gallery/${id}/janda`
    };
    return data;
  } catch (err: any) {
    throw Error(err.message);
  }
}