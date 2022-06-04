import { load } from "cheerio";
import p from "phin";
import c from "../../utils/options";

interface IHentaiFoxSearch {
  title: string;
  cover: string;
  id: number;
  category: string;
  link: string;
}

export async function scrapeContent(url: string) {
  try {
    const res = await p(url);
    const $ = load(res.body as Buffer);

    const title = $("h2.g_title").map((i, abc) => {
      return $(abc).text();
    }).get();

    const link = $("h2.g_title").map((i, abc) => {
      //return number only
      return $(abc)?.children("a")?.attr("href")?.split("/")[2];
    }).get();

    const category = $("h3.g_cat").map((i, abc) => {
      return $(abc)?.children("a")?.attr("href")?.split("/")[2];
    }).get();

    const imgSrc = $("img").map((i, el) => $(el).attr("data-cfsrc")).get();
    const imgSrcClean = imgSrc.slice(0, imgSrc.length - 1);
    
    const content = [];
    for (const abc of title) {
      const objectData: IHentaiFoxSearch = {
        title: title[title.indexOf(abc)],
        cover: imgSrcClean[title.indexOf(abc)],
        id: parseInt(link[title.indexOf(abc)]),
        category: category[title.indexOf(abc)],
        link: `${c.HENTAIFOX}/gallery/${link[title.indexOf(abc)]}`,
      };
      content.push(objectData);

    }

    const data = {
      data: content.filter(con => con.category !== ""),
      page: Number(url.split("&page=")[1]),
      sort: url.split("&sort=")[1].split("&")[0],
      source: url,
    };
    return data;
  } catch (err: any) {
    throw Error(err.message);
  }
}