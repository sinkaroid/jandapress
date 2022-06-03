import { load } from "cheerio";
import p from "phin";
import c from "../../utils/options";
import { isText } from "domhandler";
import { getPururinInfo, getPururinPageCount } from "../../utils/modifier";

export async function scrapeContent(url: string) {
  try {
    const res = await p(url);
    const $ = load(res.body);
    const dataRaw = $("img.card-img-top");
    const info = $("div.info");

    const infoBook = [];
    for (let i = 0; i < info.length; i++) {
      const child = info[i].children[0];
      if (isText(child)) {
        infoBook.push(getPururinInfo(child.data));
      }
    }

    const content = [];
    for (const elm of dataRaw) {

      const objectData = {
        title: elm.attribs["alt"],
        cover: elm.attribs["data-src"].replace(/^\/\//, "https://"),
        id: elm.attribs["data-src"].split("data/")[1].split("/cover")[0],
        info: infoBook[dataRaw.index(elm)],
        link: `${c.PURURIN}/gallery/${elm.attribs["data-src"].split("data/")[1].split("/cover")[0]}/janda`,
        total: getPururinPageCount(infoBook[dataRaw.index(elm)])
      };
      content.push(objectData);

    }

    const data = {
      data: content,
      page: Number(url.split("&page=")[1]),
      sort: url.split("/search/")[1].split("?")[0],
      source: c.PURURIN,
    };
    return data;
  } catch (err: any) {
    throw Error(err.message);
  }
}