import { load } from "cheerio";
import p from "phin";
import c from "../../utils/options";

interface IHentai2readGet {
  title: string;
  id: string;
  image: string[];
}

interface IHentai2readGetPush {
  data: object;
  main_url: string;
  current_url: string;
  next_url?: string;
  previus_url?: string;

}

export async function scrapeContent(url: string) {
  try {
    const res = await p(url);
    const $ = load(res.body as Buffer);
    const script = $("script").map((i, el) => $(el).text()).get();

    //find 'var gData = {}' inside script
    const gData = script.find(el => el.includes("var gData"));
    const gDataClean: string = gData?.replace(/[\s\S]*var gData = /, "").replace(/;/g, "").replace(/'/g, "\"") || "";
    const gDataJson = JSON.parse(gDataClean);
    const images = gDataJson.images.map((el: any) => `https://cdn-ngocok-static.sinxdr.workers.dev/hentai${el}`);
   
    const objectData: IHentai2readGet = {
      title: gDataJson.title,
      id: url.replace(c.HENTAI2READ, ""),
      image: images
    };

    const data: IHentai2readGetPush = {
      data: objectData,
      main_url: gDataJson.mainURL,
      current_url: gDataJson.currentURL,
      next_url: gDataJson.nextURL,
      previus_url: gDataJson.previousURL
    };
    return data;
  } catch (err: any) {
    throw Error(err.message);
  }
}