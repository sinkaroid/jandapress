import p from "phin";
import c from "../../utils/options";
import { getDate, timeAgo } from "../../utils/modifier";

interface INhentaiSearch {
  title: string;
  id: number;
  language: string;
  upload_date: string;
  total: number;
  cover: string;
  tags: string[];
}

export async function scrapeContent(url: string) {
  try {
    const res = await p({ url: url, parse: "json" });
    const rawData: any = res.body;
  
    const content = [];
    const GALLERY = "https://i.nhentai.net/galleries";
    const TYPE: any = {
      j: "jpg",
      p: "png",
      g: "gif",
    };
    for (let i = 0; i < rawData.result.length; i++) {
      const time = new Date(rawData.result[i].upload_date * 1000);
      const objectData: INhentaiSearch = {
        title: rawData.result[i].title,
        id: rawData.result[i].id,
        language: rawData.result[i].tags.find((tag: any) => tag.type === "language") ? rawData.result[i].tags.find((tag: any) => tag.type === "language").name : null,
        upload_date: `${getDate(time)} (${timeAgo(time)})`,
        total: rawData.result[i].num_pages,
        cover: `${GALLERY}/${rawData.result[i].media_id}/1.${TYPE[rawData.result[i].images.cover.t]}`,
        tags: rawData.result[i].tags.map((tag: any) => tag.name),
      };
      content.push(objectData);
    }
    
    const data = {
      data: content,
      page: Number(url.split("&page=")[1]),
      sort: url.split("&sort=")[1].split("&")[0],
      source: url.replace(c.NHENTAI_IP, c.NHENTAI),
    };
    return data;
    
  } catch (err: any) {
    throw Error(err.message);
  }
}