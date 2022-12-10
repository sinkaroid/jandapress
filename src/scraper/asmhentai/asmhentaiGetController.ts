import { load } from "cheerio";
import p from "phin";
import c from "../../utils/options";


interface IGetAsmhentai {
  title: string;
  id: number;
  tags: string[];
  total: number;
  image: string[];
  upload_date: string;
}

interface IData{
  data: object;
  source: string;
}

export async function scrapeContent(url: string) {
  try {
    const res = await p({ url: url, followRedirects: true });
    const $ = load(res.body as Buffer);
    
    const title = $("h1").text();
    const id = parseInt(url.replace(/[^\d]/g, ""));
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

    const objectData: IGetAsmhentai = {
      title: title,
      id: id,
      tags: tagsClean,
      total: total,
      image: image,
      upload_date: date[1] ? date[1] : "Unknown"
    };

    const data: IData = {
      data: objectData,
      source: `${c.ASMHENTAI}/g/${id}/`
    };
    return data;
  } catch (err) {
    const error = err as string;
    throw new Error(error);
  }
}