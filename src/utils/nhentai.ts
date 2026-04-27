import c from "./options";
import { NhentaiV2GallerySummary } from "../interfaces/nhentai-v2";

export const NHENTAI_SEARCH_SORTS = [
  "date",
  "popular",
  "popular-today",
  "popular-week",
  "popular-month",
] as const;

export function nhentaiGetUrl(book: string) {
  return `${c.NHENTAI}/api/v2/galleries/${book}`;
}

export function nhentaiSearchUrl(key: string, page: number, sort: string) {
  return `${c.NHENTAI}/api/v2/search?query=${encodeURIComponent(key)}&sort=${encodeURIComponent(sort)}&page=${page}`;
}

export function nhentaiRelatedUrl(book: string) {
  return `${c.NHENTAI}/api/v2/galleries/${book}/related`;
}

export function nhentaiRandomUrl() {
  return `${c.NHENTAI}/api/v2/galleries/random`;
}

export function mapNhentaiV2Summary(item: NhentaiV2GallerySummary) {
  const pretty = item.english_title || item.japanese_title || "";
  return {
    title: {
      english: item.english_title || "",
      japanese: item.japanese_title || "",
      pretty,
    },
    id: item.id,
    total: item.num_pages,
    cover: item.thumbnail,
    tag_ids: item.tag_ids || [],
    blacklisted: item.blacklisted,
    source: `${c.NHENTAI}/g/${item.id}`,
  };
}
