import test from "node:test";
import assert from "node:assert/strict";
import p from "phin";

const port = process.env.PORT ?? 3000;

type ApiResponse = {
  success: boolean;
  data?: {
    id?: number;
  };
};

async function run(path: string, id?: number) {
  const res = await p({
    url: `http://localhost:${port}${path}`,
    parse: "json"
  });

  assert.equal(res.statusCode, 200);

  const json = res.body as ApiResponse;

  console.log(JSON.stringify(json, null, 2));

  assert.equal(json.success, true);

  if (id !== undefined) {
    assert.equal(json.data?.id, id);
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