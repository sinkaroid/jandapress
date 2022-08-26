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
    const $ = load(res.body);
    
    const title: string = $("h1").text();
    const id: number = parseInt(url.replace(/[^\d]/g, ""));
    const tags: string[] = $("span.badge.tag")?.map((i, el) => $(el).text()).get();
    const tagsClean: string[] = tags.map((tag: string) => tag.replace(/[0-9]|[.,()]/g, "").trim());
    const total: number = parseInt($("input[id='t_pages']")?.attr("value") || "0");
    const img: string = $("img[data-src]")?.attr("data-src") || "";
    const imageUrl: string = img.replace("//", "https://");
    const date: string[] = $("div.pages h3").map((i, el) => $(el).text()).get();

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
      upload_date: date[1].replace("Added: ", "")
    };

    const data: IData = {
      data: objectData,
      source: `${c.ASMHENTAI}/g/${id}/`
    };
    return data;
  } catch (err: any) {
    throw Error(err.message);
  }
}