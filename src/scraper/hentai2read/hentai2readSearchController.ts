import { load } from "cheerio";
import p from "phin";
import c from "../../utils/options";
import { getId } from "../../utils/modifier";

interface IHentai2readSearch {
  title: string;
  cover: string;
  id: string;
  link: string;
  message: string;
}

export async function scrapeContent(url: string) {
  try {
    const res = await p(url);
    const $ = load(res.body as Buffer);
    const title = $(".title-text").map((i, el) => $(el).text()).get();
    const imgSrc = $("img").map((i, el) => $(el).attr("data-src")).get();
    const id = $(".overlay-title").map((i, el) => $(el).children("a").attr("href")).get();
    const idClean = id.map(el => getId(el));

    const content = [];
    for (const abc of title) {
      const objectData: IHentai2readSearch = {
        title: title[title.indexOf(abc)],
        cover: `${c.HENTAI2READ}${imgSrc[title.indexOf(abc)]}`,
        id: idClean[title.indexOf(abc)],
        link: `${c.HENTAI2READ}${idClean[title.indexOf(abc)]}`,
        message: "Required chapter number is mandatory",
      };
      content.push(objectData);

    }

    const data = {
      data: content,
      source: url,
    };
    return data;
  } catch (err: any) {
    throw Error(err.message);
  }
}