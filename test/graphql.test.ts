/// <reference types="bun" />
import { expect, test } from "bun:test";
import { graphql, type GraphQLArgs } from "graphql";
import { schema } from "../src/graphql/schema";

interface GetResult {
  success: boolean;
  data: { id: number | string };
  source: string;
}

interface GQLData {
  nhentai?: { get: GetResult };
  pururin?: { get: GetResult };
  hentaifox?: { get: GetResult };
  asmhentai?: { get: GetResult };
  hentai2read?: { get: GetResult };
  simplyHentai?: { get: GetResult };
  threehentai?: { get: GetResult };
}

interface GQLResponse {
  errors?: Array<{ message: string }>;
  data?: GQLData;
}

async function run(source: string, variableValues?: Record<string, unknown>): Promise<GQLResponse> {
  const args: GraphQLArgs = { schema, source };
  if (variableValues) args.variableValues = variableValues;
  const res = await graphql(args) as GQLResponse;
  if (res.errors) console.log("errors:", JSON.stringify(res.errors));
  return res;
}

function expectOk(res: GQLResponse, field: keyof GQLData, id?: number | string) {
  expect(res.data).toBeDefined();
  const prov = res.data![field];
  expect(prov).toBeDefined();
  expect(prov!.get.success).toBe(true);
  if (id !== undefined) {
    expect(prov!.get.data.id).toBe(id);
  }
}

test("nhentai", async () => {
  const res = await run("{ nhentai { get(book: 577774) { success data { id } source } } }");
  expectOk(res, "nhentai", 577774);
});

test("pururin", async () => {
  const res = await run("{ pururin { get(book: 47226) { success data { id } source } } }");
  expectOk(res, "pururin", 47226);
});

test("hentaifox", async () => {
  const res = await run("{ hentaifox { get(book: 59026) { success data { id } source } } }");
  expectOk(res, "hentaifox", 59026);
});

test("asmhentai", async () => {
  const res = await run("{ asmhentai { get(book: 308830) { success data { id } source } } }");
  expectOk(res, "asmhentai", 308830);
});

test("hentai2read", async () => {
  const book = "butabako_shotaone_matome_fgo_hen/1";
  const q = "{ hentai2read { get(book: \"" + book + "\") { success data { id } source } } }";
  const res = await run(q);
  expectOk(res, "hentai2read");
  expect(res.data!.hentai2read!.get.data.id).toBeString();
});

test("simply-hentai", async () => {
  const book = "fate-grand-order/fgo-sanbunkatsuhou/all-pages";
  const q = "{ simplyHentai { get(book: \"" + book + "\") { success data { id } source } } }";
  const res = await run(q);
  expect(res.data).toBeDefined();
  expect(res.data!.simplyHentai).toBeDefined();
  expect(res.data!.simplyHentai!.get.success).toBe(true);
});

test("3hentai", async () => {
  const res = await run("{ threehentai { get(book: 608979) { success data { id } source } } }");
  expectOk(res, "threehentai", 608979);
});
