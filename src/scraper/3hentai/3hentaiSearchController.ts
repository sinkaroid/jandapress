import { load } from "cheerio";
import JandaPress from "../../JandaPress";
import { removeNonNumeric } from "../../utils/modifier";

interface I3HentaiSearch {
  title: string;
  id: number;
}

const janda = new JandaPress();

export async function scrapeContent(url: string) {
  try {
    const res = await janda.fetchBody(url);
    const $ = load(res);

    //in <div class="listing-container bg-container container-xl"> there are <div class="doujin-col">
    const doujinCol = $("div.listing-container.bg-container.container-xl");
    //in <div class="doujin-col"> there are <div class="doujin">
    const doujin = doujinCol.find("div.doujin");

    //map all href in <div class="doujin">
    const href = doujin.map((i, el) => $(el).find("a").attr("href")).get();
    // const book = href.map((id: string) => id.split("/").pop());

    //There is two <div class="title flag flag-eng"> and <div class="title flag flag-jpn">, get all text 
    const title = doujin.map((i, el) => $(el).find("div.title").text()).get();
    const titleClean = title.map((title: string) => title.replace(/<[^>]*>/g, "").replace(/\n/g, "").trim());


    const content = [];
    for (const [i, val] of href.entries()) {
      const id = removeNonNumeric(val);
      const objectData: I3HentaiSearch = {
        title: titleClean[i],
        id: parseInt(id),
      };
      content.push(objectData);
    }

    if (content.length === 0) throw Error("No result found");

    const data = {
      success: true,
      data: content,
      page: parseInt(url.split("&page=")[1]),
      sort: url.split("sort=")[1],
      source: url
    };
    return data;
    
  } catch (err) {
    const e = err as Error;
    throw Error(e.message);
  }
}