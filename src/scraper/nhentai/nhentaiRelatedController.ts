import p from "phin";
import c from "../../utils/options";
import { getDate, timeAgo } from "../../utils/modifier";

interface INhentaiRelated {
  title: string;
  id: number;
  language: string;
  upload_date: string;
  total: number;
  tags: string[];
}

export async function scrapeContent(url: string) {
  try {
    const res = await p({ url: url, parse: "json" });
    const rawData: any = res.body;
  
    const content = [];
    for (let i = 0; i < rawData.result.length; i++) {
      const time = new Date(rawData.result[i].upload_date * 1000);
      const objectData: INhentaiRelated = {
        title: rawData.result[i].title,
        id: rawData.result[i].id,
        language: rawData.result[i].tags.find((tag: any) => tag.type === "language") ? rawData.result[i].tags.find((tag: any) => tag.type === "language").name : null,
        upload_date: `${getDate(time)} (${timeAgo(time)})`,
        total: rawData.result[i].num_pages,
        tags: rawData.result[i].tags.map((tag: any) => tag.name),
      };
      content.push(objectData);
    }
    
    const data = {
      data: content,
      source: url.replace(c.NHENTAI_IP, c.NHENTAI),
    };
    return data;
    
  } catch (err: any) {
    throw Error(err.message);
  }
}