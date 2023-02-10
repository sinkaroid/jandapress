import { load } from "cheerio";
import JandaPress from "../../JandaPress";
import c from "../../utils/options";

interface IGet3hentai {
  title: string;
  id: number;
  tags: string[];
  total: number;
  image: string[];
  upload_date: string;
  
}

interface IData {
  success?: boolean;
  data: object;
  source: string;
}

const janda = new JandaPress();

export async function scrapeContent(url: string) {
  try {
    const res = await janda.fetchBody(url);
    const $ = load(res);
    
    //get href in <div id="main-cover"> first
    const actualId = $("#main-cover").find("a").attr("href");
    //get after last second '/' in asu
    const book = actualId?.split("/")[4];
    
    const title = $("h1").text();
    const id = parseInt(url.split("/").pop() as string) || parseInt(book as string);
    const tags = $("span.filter-elem")?.map((i, el) => $(el).text()).get();
    const tagsClean = tags.map((tag: string) => tag.replace(/<[^>]*>/g, "").replace(/\n/g, "").trim());
    const image = $("div.single-thumb-col")?.map((i, el) => $(el).find("img").attr("data-src")).get();
    if (image.length === 0) throw Error("No result found");

    const imageClean = image.map((img: string) => img.replace("t.", "."));
    const upload_date = $("time").text();

    const objectData: IGet3hentai = {
      title: title,
      id: id,
      tags: tagsClean.slice(0, tagsClean.length - 1),
      total: image.length,
      image: imageClean,
      upload_date: upload_date,
    };

    const data: IData = {
      success: true,
      data: objectData,
      source: `${c.THREEHENTAI}/d/${id ? id : book}`,
    };
    return data;
  } catch (err) {
    const e = err as Error;
    throw Error(e.message);
  }
}