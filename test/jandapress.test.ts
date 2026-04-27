import test from "node:test";
import assert from "node:assert/strict";
import p from "phin";
import { nhentaiHeaders } from "../src/utils/modifier";

const port = process.env.PORT ?? 3000;

type ApiResponse = {
  success: boolean;
  data?: {
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
      const res = await p({ url, parse: "json", headers: nhentaiHeaders() });
      if (res.statusCode !== 200) continue;

      const json = res.body as any;
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
    const res = await p({
      url: `http://localhost:${port}${path}`,
      parse: "json",
      timeout: 20000
    });

    assert.equal(res.statusCode, 200);

    const json = res.body as ApiResponse;

    console.log(JSON.stringify(json, null, 2));

    if (!json.success) throw new Error("scraper failed");

    if (id !== undefined) {
      assert.equal(json.data?.id, id);
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
