import { load } from "cheerio";
import JandaPress from "../../JandaPress";
import c from "../../utils/options";

interface IHentaiFoxGet {
  title: string;
  id: number;
  tags: string[];
  type: string;
  total: number;
  image: string[];
}

const janda = new JandaPress();

export async function scrapeContent(url: string) {
  try {
    const res = await janda.fetchBody(url);
    const $ = load(res);
    const id = parseInt($("a.g_button")?.attr("href")?.split("/")[2] || "");
  
    const category = $("a.tag_btn").map((i, abc) => {
      return $(abc)?.text()?.replace(/[0-9]/g, "").trim();
    }).get();

    const imgSrc = $("img").map((i, el) => $(el).attr("data-src")).get();
    const parameterImg2 = imgSrc[0].split("/").slice(0, 5).join("/");
    const extensionImg = `.${imgSrc[0].split(".").slice(-1)[0]}`;
    const info = $("span.i_text.pages").map((i, abc) => {
      return $(abc).text();
    }).get();

    const pageCount = parseInt(info[0].replace(/[^0-9]/g, ""));
    const image = [];
    for (let i = 0; i < Number(pageCount); i++) {
      image.push(`${parameterImg2}/${i + 1}${extensionImg}`);
    }
    const titleInfo = $("div.info").children("h1").text();
   
    const objectData: IHentaiFoxGet = {
      title: titleInfo,
      id: id,
      tags: category,
      type: extensionImg,
      total: pageCount,
      image: image,
    };

    const data = {
      success: true,
      data: objectData,
      source: `${c.HENTAIFOX}/gallery/${id}/`,
    };
    return data;
  } catch (err) {
    const e = err as Error;
    throw Error(e.message);
  }
}