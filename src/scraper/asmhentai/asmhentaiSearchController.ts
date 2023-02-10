import { load } from "cheerio";
import JandaPress from "../../JandaPress";
import { removeNonNumeric } from "../../utils/modifier";

interface IAsmHentaiSearch {
  title: string;
  id: number;
}

const janda = new JandaPress();

export async function scrapeContent(url: string) {
  try {
    const res = await janda.fetchBody(url);
    const $ = load(res);

    //get all <img alt= inside <div class="image">
    const title = $("div.image").map((i, el) => {
      const img = $(el).find("img");
      return img.attr("alt");
    }
    ).get();

    //get all href inside <div class="image">, get only number
    const id = $("div.image").map((i, el) => {
      const href = $(el).find("a");
      return href.attr("href");
    }).get();


    const content = [];
    for (const abc of title) {

      const objectData: IAsmHentaiSearch = {
        title: abc.split("\n")[0],
        id: parseInt(removeNonNumeric(id[title.indexOf(abc)])),

      };
      content.push(objectData);
    }

    if (content.length === 0) throw Error("No result found");

    const data = {
      success: true,
      data: content,
      page: parseInt(url.split("&page=")[1]),
      sort: url.split("/search/")[1].split("?")[0],
      source: url
    };
    return data;
  } catch (err) {
    const e = err as Error;
    throw Error(e.message);
  }
}