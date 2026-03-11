import test from "node:test";
import assert from "node:assert/strict";
import p from "phin";
import c from "../src/utils/options";
import { name, version } from "../package.json";

const UA = `${name}/${version} Node.js/22.22.0`;

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
  const res = await p({
    url,
    headers: { "User-Agent": UA },
    followRedirects: true
  });

  const ok = [200, 301, 308].includes(res.statusCode || 0);

  console.log(`${url} → ${res.statusCode}`);

  assert.equal(
    ok,
    true,
    `${url} (${getKeyByValue(c, url)}) is not available`
  );
}

for (const url of sources) {
  test(`source: ${getKeyByValue(c, url)}`, async () => {
    await check(url);
  });
}