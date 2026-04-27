import JandaPress from "../../JandaPress";
import c from "../../utils/options";
import { getDate, timeAgo } from "../../utils/modifier";
import { INhentaiSearch } from "../../interfaces/nhentai";
import { NhentaiV2Detail, NhentaiV2GallerySummary, NhentaiV2ListResponse, NhentaiV2Tag } from "../../interfaces/nhentai-v2";

const janda = new JandaPress();

export async function scrapeContent(url: string) {
  try {
    const res = await janda.fetchJson(url);
    const rawData = res as NhentaiV2ListResponse;
    const tagMap = await resolveTagMap(rawData.result);
    const uploadDateMap = await resolveUploadDateMap(rawData.result.map((item) => item.id));
    const content: INhentaiSearch[] = rawData.result.map((item) => {
      const resolvedTags = (item.tag_ids || [])
        .map((tagId) => tagMap.get(tagId))
        .filter((tag): tag is NhentaiV2Tag => Boolean(tag));
      const language = resolvedTags.find((tag) => tag.type === "language")?.name || "";
      const tags = resolvedTags
        .filter((tag) => tag.type === "tag")
        .map((tag) => tag.name);
      const upload_date = formatUploadDate(uploadDateMap.get(item.id));

      return {
        title: {
          english: item.english_title || "",
          japanese: item.japanese_title || "",
          pretty: item.english_title || item.japanese_title || "",
        },
        id: item.id,
        language,
        upload_date,
        total: item.num_pages,
        cover: item.thumbnail,
        tags,
      };
    });
    const endpoint = new globalThis.URL(url);
    const page = Number(endpoint.searchParams.get("page") || 1);
    const sort = endpoint.searchParams.get("sort") || "date";

    const data = {
      success: true,
      data: content,
      page,
      sort,
      source: `${c.NHENTAI}${endpoint.pathname}`,
    };
    return data;

  } catch (err) {
    const e = err as Error;
    throw Error(e.message);
  }
}

async function resolveTagMap(items: NhentaiV2GallerySummary[]): Promise<Map<number, NhentaiV2Tag>> {
  const ids = Array.from(
    new Set(items.flatMap((item) => item.tag_ids || [])),
  );

  if (ids.length === 0) {
    return new Map<number, NhentaiV2Tag>();
  }

  const CHUNK_SIZE = 80;
  const tagMap = new Map<number, NhentaiV2Tag>();

  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    const chunk = ids.slice(i, i + CHUNK_SIZE);
    const endpoint = `${c.NHENTAI}/api/v2/tags/ids?ids=${chunk.join(",")}`;

    try {
      const res = await janda.fetchJson(endpoint);
      const tags = res as NhentaiV2Tag[];
      for (const tag of tags) {
        tagMap.set(tag.id, tag);
      }
    } catch {
      // Keep response compatible even when tag resolve endpoint is flaky.
    }
  }

  return tagMap;
}

async function resolveUploadDateMap(ids: number[]): Promise<Map<number, number>> {
  const uploadDateMap = new Map<number, number>();
  const CHUNK_SIZE = 5;

  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    const chunk = ids.slice(i, i + CHUNK_SIZE);
    const chunkResponses = await Promise.all(
      chunk.map(async (id) => {
        try {
          const endpoint = `${c.NHENTAI}/api/v2/galleries/${id}`;
          const res = await janda.fetchJson(endpoint);
          const detail = res as Pick<NhentaiV2Detail, "upload_date">;
          return { id, upload_date: detail.upload_date };
        } catch {
          return null;
        }
      }),
    );

    for (const row of chunkResponses) {
      if (!row || !Number.isFinite(row.upload_date)) continue;
      uploadDateMap.set(row.id, row.upload_date);
    }
  }

  return uploadDateMap;
}

function formatUploadDate(unixSeconds?: number): string {
  if (!unixSeconds || !Number.isFinite(unixSeconds)) return "";

  const time = new Date(unixSeconds * 1000);
  return `${getDate(time)} (${timeAgo(time)})`;
}
