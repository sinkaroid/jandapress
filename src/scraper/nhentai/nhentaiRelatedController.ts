import JandaPress from "../../JandaPress";
import c from "../../utils/options";
import { getDate, timeAgo } from "../../utils/modifier";
import { NhentaiSearch } from "../../interfaces";

interface INhentaiRelated {
  title: {
    english: string;
    japanese: string;
    pretty: string
  };
  id: number;
  language: string;
  upload_date: string;
  total: number;
  tags: string[];
}

const janda = new JandaPress();

export async function scrapeContent(url: string) {
  try {
    const res = await janda.fetchJson(url);
    const rawData = res as NhentaiSearch;

    const content = [];
    for (let i = 0; i < rawData.result.length; i++) {
      const time = new Date(rawData.result[i].upload_date * 1000);
      const objectData: INhentaiRelated = {
        title: {
          english: rawData.result[i].title.english,
          japanese: rawData.result[i].title.japanese,
          pretty: rawData.result[i].title.pretty,
        },
        id: rawData.result[i].id,
        language: rawData.result[i].tags.find((tag) => tag.type === "language")?.name || "",
        upload_date: `${getDate(time)} (${timeAgo(time)})`,
        total: rawData.result[i].num_pages,
        tags: rawData.result[i].tags.map((tag) => tag.name),
      };
      content.push(objectData);
    }

    const data = {
      success: true,
      data: content,
      source: url.replace(c.NHENTAI_IP, c.NHENTAI),
    };
    return data;

  } catch (err: any) {
    throw Error(err.message);
  }
}