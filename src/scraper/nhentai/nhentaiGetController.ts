import p from "phin";
import c from "../../utils/options";
import { getDate, timeAgo } from "../../utils/modifier";
import * as pkg from "../../../package.json";
import { CookieJar } from "tough-cookie";
import { HttpsCookieAgent } from "http-cookie-agent/http";
import { config } from "dotenv";
config();

interface INhentaiGet {
  title: string;
  optional_title: object;
  id: number;
  language: string;
  tags: string[];
  total: number;
  image: string[];
  num_pages: number;
  num_favorites: number;
  artist: string[];
  group: string;
  parodies: string;
  characters: string[];
  upload_date: string;
}

const jar = new CookieJar();
jar.setCookie(process.env.CF as string, "https://nhentai.net/");

export async function scrapeContent(url: string) {
  try {
    const res = await p({
      url: url,
      core: {
        agent: new HttpsCookieAgent({ cookies: { jar, }, }),
      },
      "headers": {
        "User-Agent": `${pkg.name}/${pkg.version} Node.js/16.9.1`
      },
      parse: "json",
    });
    console.log(res.statusCode);
    
    const GALLERY = "https://i.nhentai.net/galleries";
    const TYPE: any = {
      j: "jpg",
      p: "png",
      g: "gif",
    };

    const dataRaw: any = res.body;
    const imagesRaw = dataRaw.images.pages;

    const images: string[] = Object.keys(imagesRaw)
      .map((key: string) => imagesRaw[key].t);

    const imageList = [];
    for (let i = 0; i < images.length; i++) {
      imageList.push(`${GALLERY}/${dataRaw.media_id}/${i + 1}.${TYPE[images[i]]}`);
    }

    //get all tags.name
    const tagsRaw = dataRaw.tags;
    const tags: string[] = Object.keys(tagsRaw).map((key: string) => tagsRaw[key].name);

    const artistRaw = tagsRaw.filter((tag: any) => tag.type === "artist");
    const artist: string[] = artistRaw.map((tag: any) => tag.name) || [];

    //find "type": "language" in tagsRaw
    const languageRaw = tagsRaw.find((tag: any) => tag.type === "language");
    const language = languageRaw ? languageRaw.name : null;

    const parodiesRaw = tagsRaw.find((tag: any) => tag.type === "parody");
    const parodies = parodiesRaw ? parodiesRaw.name : null;

    const groupRaw = tagsRaw.find((tag: any) => tag.type === "group");
    const group = groupRaw ? groupRaw.name : null;

    //get all "type": "character" in tagsRaw
    const charactersRaw = tagsRaw.filter((tag: any) => tag.type === "character");
    const characters: string[] = charactersRaw.map((tag: any) => tag.name) || [];

    const time = new Date(dataRaw.upload_date * 1000);

    const objectData: INhentaiGet = {
      title: dataRaw.title.pretty,
      optional_title: {
        english: dataRaw.title.english,
        japanese: dataRaw.title.japanese,
        pretty: dataRaw.title.pretty,
      },
      id: dataRaw.id,
      language: language,
      tags: tags,
      total: imageList.length,
      image: imageList,
      num_pages: dataRaw.num_pages,
      num_favorites: dataRaw.num_favorites,
      artist: artist,
      group: group,
      parodies: parodies,
      characters: characters,
      upload_date: `${getDate(time)} (${timeAgo(time)})`,
    };

    const data = {
      data: objectData,
      source: `${c.NHENTAI}/g/${dataRaw.id}`,
    };
    return data;
  } catch (err: any) {
    throw Error(err.message);
  }
}