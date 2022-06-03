import { load } from "cheerio";
import p from "phin";
import c from "../../utils/options";

export async function scrapeContent(url: string) {
  try {
    const res = await p(url);
    const $ = load(res.body as Buffer);
    //get all <script>
    const script = $("script").map((i, el) => $(el).text()).get();

    //find 'var gData = {}' inside script
    const gData = script.find(el => el.includes("var gData"));
    //remove all javascript code
    const gDataClean: string = gData?.replace(/[\s\S]*var gData = /, "").replace(/;/g, "").replace(/'/g, "\"") || "";
    const gDataJson = JSON.parse(gDataClean);

    //add "https://" before all image array
    const images = gDataJson.images.map((el: any) => `https://cdn-ngocok-static.sinxdr.workers.dev/hentai${el}`);

 
   
    const objectData = {
      title: gDataJson.title,
      id: url.replace(c.HENTAI2READ, ""),
      image: images,
 

    };

    const data = {
      data: objectData,
      main_url: gDataJson.mainURL,
      current_url: gDataJson.currentURL,
      next_url: gDataJson.nextURL,
      previous_url: gDataJson.previousURL
    };
    return data;
  } catch (err: any) {
    throw Error(err.message);
  }
}