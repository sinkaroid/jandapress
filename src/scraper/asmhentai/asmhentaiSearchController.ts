import { load } from "cheerio";
import p from "phin";
import { removeNonNumeric } from "../../utils/modifier";

interface IAsmHentaiSearch {
  title: string;
  id: number;
}

export async function scrapeContent(url: string) {
  try {
    const res = await p(url);
    const $ = load(res.body as Buffer);

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

    const data = {
      data: content,
      page: parseInt(url.split("&page=")[1]),
      sort: url.split("/search/")[1].split("?")[0],
      source: url
    };
    return data;
  } catch (err: any) {
    throw Error(err.message);
  }
}