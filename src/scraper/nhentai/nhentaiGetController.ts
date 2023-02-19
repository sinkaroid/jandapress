import JandaPress from "../../JandaPress";
import c from "../../utils/options";
import { getDate, timeAgo } from "../../utils/modifier";
import { Nhentai } from "../../interfaces";

const extension = {
  j: "jpg",
  p: "png",
  g: "gif",
};

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
  parodies: string[];
  characters: string[];
  upload_date: string;
}

const janda = new JandaPress();

export async function scrapeContent(url: string, random = false) {
  try {
    let res, raw;
    if (random) res = await janda.simulateNhentaiRequest(url), raw = res as Nhentai;
    else res = await janda.fetchJson(url), raw = res as Nhentai;

    const GALLERY = "https://i.nhentai.net/galleries";
    const imagesRaw = raw.images.pages;

    const images = Object.keys(imagesRaw)
      .map((key) => imagesRaw[parseInt(key)].t);

    const imageList = [];
    for (let i = 0; i < images.length; i++) {
      imageList.push(`${GALLERY}/${raw.media_id}/${i + 1}.${(extension as any)[images[i]]}`);
    }

    //get all tags.name
    const tagsRaw = raw.tags;
    // all tags without filter
    // const tags = Object.keys(tagsRaw).map((key) => tagsRaw[parseInt(key)].name);

    const tagsFilter = tagsRaw.filter((tag) => tag.type === "tag");
    const tags = tagsFilter.map((tag) => tag.name).sort() || [];

    const artistRaw = tagsRaw.filter((tag) => tag.type === "artist");
    const artist = artistRaw.map((tag) => tag.name) || [];

    //find "type": "language" in tagsRaw
    const languageRaw = tagsRaw.find((tag) => tag.type === "language");
    const language = languageRaw ? languageRaw.name : "";

    const parodiesRaw = tagsRaw.filter((tag) => tag.type === "parody");
    const parodies = parodiesRaw.map((tag) => tag.name) || [];

    const groupRaw = tagsRaw.find((tag) => tag.type === "group");
    const group = groupRaw ? groupRaw.name : "None";

    //get all "type": "character" in tagsRaw
    const charactersRaw = tagsRaw.filter((tag) => tag.type === "character");
    const characters = charactersRaw.map((tag) => tag.name) || [];

    const time = new Date(raw.upload_date * 1000);

    const objectData: INhentaiGet = {
      title: raw.title.pretty,
      optional_title: {
        english: raw.title.english,
        japanese: raw.title.japanese,
        pretty: raw.title.pretty,
      },
      id: raw.id,
      language: language,
      tags: tags,
      total: imageList.length,
      image: imageList,
      num_pages: raw.num_pages,
      num_favorites: raw.num_favorites,
      artist: artist,
      group: group,
      parodies: parodies,
      characters: characters,
      upload_date: `${getDate(time)} (${timeAgo(time)})`,
    };

    const data = {
      success: true,
      data: objectData,
      source: `${c.NHENTAI}/g/${raw.id}`,
    };
    return data;
  } catch (err) {
    const e = err as Error;
    throw Error(e.message);
  }
}