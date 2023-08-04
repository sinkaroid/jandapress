import { load } from "cheerio";
import JandaPress from "../../JandaPress";
import { isText } from "domhandler";
import { getPururinInfo, getPururinPageCount, getPururinLanguage } from "../../utils/modifier";

interface ISearchPururin {
  title: string;
  cover: string | null;
  id: number;
  language: string;
  info: string;
  link: string;
  total: number;
}

interface IData {
  success: boolean;
  data: object;
  page: number;
  sort: string | null;
  source: string;
}

const janda = new JandaPress();

export async function scrapeContent(url: string) {
  try {
    const res = await janda.fetchBody(url);
    const $ = load(res);
    const dataRaw = $(".card.card-gallery");
    const info = $("div.info");
    const card = $("img.card-img-top").map((i, abc) => {
      return abc.attribs["src"];
    }).get();

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
        title: abc.attribs["title"],
        cover: card ? card[dataRaw.index(abc)] : null,
        id: parseInt(abc.attribs["data-gid"]),
        language: getPururinLanguage(infoBook[dataRaw.index(abc)]) || "Unknown",
        info: infoBook[dataRaw.index(abc)],
        link: abc.attribs["data-href"],
        total: getPururinPageCount(infoBook[dataRaw.index(abc)])
      };
      content.push(objectData);
    }

    if (content.length === 0) throw Error("No result found");

    const data: IData = {
      success: true,
      data: content,
      page: parseInt(url.split("&page=")[1]),
      sort: null,
      source: url
    };
    return data;
  } catch (err) {
    const e = err as Error;
    throw Error(e.message);
  }
}