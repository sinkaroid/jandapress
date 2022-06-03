import { load } from "cheerio";
import p from "phin";
import c from "../../utils/options";

export async function scrapeContent(url: string) {
  try {
    const res = await p(url);
    const $ = load(res.body as Buffer);
    const id = $("a.g_button")?.attr("href")?.split("/")[2];
  
    const category = $("a.tag_btn").map((i, abc) => {
      return $(abc)?.text()?.replace(/[0-9]/g, "").trim();
    }).get();

    const imgSrc = $("img").map((i, el) => $(el).attr("data-src")).get();
    const parameterImg = imgSrc[0].split("/").slice(0, imgSrc[0].split("/").length - 1).join("/");
    const extensionImg = `.${imgSrc[0].split(".").slice(-1)[0]}`;
  
    const info = $("span.i_text.pages").map((i, abc) => {
      return $(abc).text();
    }).get();

    const pageCount = info[0].replace(/[^0-9]/g, "");
    const image = [];
    for (let i = 0; i < Number(pageCount); i++) {
      image.push(`${parameterImg}/${i + 1}${extensionImg}`);
    }
    const titleInfo = $("div.info").children("h1").text();
   
    const objectData = {
      title: titleInfo,
      id: id,
      tags: category,     
      type: extensionImg,
      total: pageCount,
      image: image,

    };

    const data = {
      data: objectData,
      source: `${c.HENTAIFOX}/gallery/${id}/`,
    };
    return data;
  } catch (err: any) {
    throw Error(err.message);
  }
}