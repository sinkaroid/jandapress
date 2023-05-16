import { load } from "cheerio";
import JandaPress from "../../JandaPress";
import prox from "../../utils/reverseprox";

interface ISearchNhentaiTo {
  title: string;
  id: number;
  cover: string;
}

interface IData {
  success: boolean;
  data: object;
  page: number;
  source: string;
}

const janda = new JandaPress();

export async function scrapeContent(url: string, isRelated = false) {
  try {
    const res = await janda.fetchBody(url);
    const $ = load(res);

    let mode;
    if (!isRelated) mode = "div.gallery";
    //in in container index-container
    else mode = "div.container.index-container";

    const dataRaw = $(mode);
    const title = dataRaw.find("div.caption").map((i, el) => {
      return $(el).text();
    }).get();

    const id = dataRaw.find("a").map((i, el) => {
      return $(el).attr("href")?.split("/")[2];
    }).get();

    const cover = dataRaw.find("img").map((i, el) => {
      return $(el).attr("src")?.replace(prox.NHENTAI_TO, prox.NHENTAI_TO_SOLVER) || $(el).attr("data-src")?.replace(prox.NHENTAI_TO, prox.NHENTAI_TO_SOLVER);
    }).get();

    let looping;
    if (!isRelated) looping = dataRaw;
    else looping = title;

    const objectData = [];
    for (let i = 0; i < looping.length; i++) {
      const searchResults: ISearchNhentaiTo = {
        title: title[i],
        id: Number(id[i]),
        cover: cover[i],
      };
      objectData.push(searchResults);
    }

    if (objectData.length === 0) throw Error("No result found");

    const data: IData = {
      success: true,
      data: objectData,
      page: Number(url.split("page=")[1]),
      source: url
    };
    return data;
    
  } catch (err) {
    const e = err as Error;
    throw Error(e.message);
  }
}