import { load } from "cheerio";
import p from "phin";
import c from "../../utils/options";
import { isText } from "domhandler";
import { getPururinInfo, getPururinPageCount } from "../../utils/modifier";

interface ISearchPururin {
  title: string;
  cover: string;
  id: number;
  info: string;
  link: string;
  total: number;
}

interface IData {
  data: object;
  page: number;
  sort: string;
  source: string;
}

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
    for (const abc of dataRaw) {

      const objectData: ISearchPururin = {
        title: abc.attribs["alt"],
        cover: abc.attribs["data-src"].replace(/^\/\//, "https://"),
        id: parseInt(abc.attribs["data-src"].split("data/")[1].split("/cover")[0]),
        info: infoBook[dataRaw.index(abc)],
        link: `${c.PURURIN}/gallery/${abc.attribs["data-src"].split("data/")[1].split("/cover")[0]}/janda`,
        total: getPururinPageCount(infoBook[dataRaw.index(abc)])
      };
      content.push(objectData);

    }

    const data: IData = {
      data: content,
      page: parseInt(url.split("&page=")[1]),
      sort: url.split("/search/")[1].split("?")[0],
      source: c.PURURIN
    };
    return data;
  } catch (err: any) {
    throw Error(err.message);
  }
}