/// <reference types="bun" />
import { expect, test } from "bun:test";
import c from "../src/utils/options";
import { name, version } from "../package.json";

const UA = `${name}/${version} Bun/1.3.13`;

const sources = [
  c.NHENTAI,
  c.HENTAIFOX,
  c.PURURIN,
  c.ASMHENTAI,
  c.SIMPLY_HENTAI_PROXIFIED,
  c.HENTAI2READ,
  c.THREEHENTAI
];

function getKeyByValue(data: Record<string, string>, value: string) {
  return Object.keys(data).find(k => data[k] === value);
}

async function check(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    redirect: "follow"
  });

  const ok = [200, 301, 308].includes(res.status || 0);

  console.log(`${url} → ${res.status}`);

  expect(ok).toBe(true);
}

for (const url of sources) {
  test(`source: ${getKeyByValue(c, url)}`, async () => {
    await check(url);
  });
}