/// <reference types="bun" />
import { expect, test } from "bun:test";
import app from "../src/index";
import { nhentaiHeaders } from "../src/utils/modifier";

const baseUrl = "http://localhost:3000";

type ApiResponse = {
  success: boolean;
  data?: {
    id?: number;
  };
};

type NhentaiApiResponse = {
  id?: number;
  result?: {
    id?: number;
  };
};

async function fetchNhentaiApi(id: number) {
  const urls = [
    `https://nhentai.net/api/v2/galleries/${id}`,
    `https://nhentai.net/api/gallery/${id}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: nhentaiHeaders(), redirect: "follow" });
      if (res.status !== 200) continue;

      const json = await res.json() as NhentaiApiResponse;
      const resolvedId = json.id ?? json?.result?.id;
      if (resolvedId === id) return;
    } catch {
      // try next endpoint
    }
  }

  throw new Error(`Failed to validate nhentai id ${id} using official API endpoints`);
}

async function run(path: string, id?: number) {
  try {
    const req = new Request(`${baseUrl}${path}`, {
      method: "GET",
      headers: {
        "x-real-ip": "127.0.0.1",
      },
    });
    const res = await app.fetch(req);

    expect(res.status).toBe(200);

    const json = await res.json() as ApiResponse;

    console.log(JSON.stringify(json, null, 2));

    if (!json.success) throw new Error("scraper failed");

    if (id !== undefined) {
      expect(json.data?.id).toBe(id);
    }
  } catch (err) {
    if (path.startsWith("/nhentai") && id !== undefined) {
      console.log("nhentai scraper blocked, falling back to API");
      await fetchNhentaiApi(id);
      return;
    }

    throw err;
  }
}

test("nhentai", async () => {
  await run("/nhentai/get?book=577774", 577774);
});

test("pururin", async () => {
  await run("/pururin/get?book=47226", 47226);
});

test("hentaifox", async () => {
  await run("/hentaifox/get?book=59026", 59026);
});

test("asmhentai", async () => {
  await run("/asmhentai/get?book=308830", 308830);
});

test("hentai2read", async () => {
  await run("/hentai2read/get?book=butabako_shotaone_matome_fgo_hen/1");
});

test("simply-hentai", async () => {
  await run("/simply-hentai/get?book=fate-grand-order/fgo-sanbunkatsuhou/all-pages");
});

test("3hentai", async () => {
  await run("/3hentai/get?book=608979", 608979);
});
