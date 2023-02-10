import { load } from "cheerio";
import JandaPress from "../../JandaPress";
import c from "../../utils/options";


interface IGetAsmhentai {
  title: string;
  id: number;
  tags: string[];
  total: number;
  image: string[];
  upload_date: string;
}

interface IData {
  success?: boolean;
  data: object;
  source: string;
}

const janda = new JandaPress();

export async function scrapeContent(url: string) {
  try {
    const res = await janda.fetchBody(url);
    const $ = load(res);

    const actualId = $(".cover").find("a").attr("href");
    const book = actualId?.replace("/gallery/", "");
    const actualBook = parseInt(book as string);

    const title = $("h1").text();
    const tags = $("span.badge.tag")?.map((i, el) => $(el).text()).get();
    const tagsClean = tags.map((tag: string) => tag.replace(/[0-9]|[.,()]/g, "").trim());
    const totalIfBroken = $("div.pages").children().first().text();
    const actualTotal = totalIfBroken.replace(/[^\d]/g, "");
    const total = parseInt($("input[id='t_pages']")?.attr("value") || actualTotal);
    const img = $("img[data-src]")?.attr("data-src") || "";
    const imageUrl = img.replace("//", "https://");
    const date = $("div.pages h3").map((i, el) => $(el).text()).get();

    const image = [];
    for (let i = 0; i < total; i++) {
      image.push(`${imageUrl.replace("cover", `${i + 1}`)}`);
    } 

    if (image.length === 0) throw Error("Not found");

    const objectData: IGetAsmhentai = {
      title: title,
      id: actualBook,
      tags: tagsClean,
      total: total,
      image: image,
      upload_date: date[1] ? date[1] : "Unknown"
    };

    const data: IData = {
      success: true,
      data: objectData,
      source: `${c.ASMHENTAI}/g/${actualBook}/`
    };
    return data;
  } catch (err) {
    const e = err as Error;
    throw Error(e.message);
  }
}