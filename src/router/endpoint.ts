import type { Hono } from "hono";
import { cors } from "hono/cors";
import { slow, limiter } from "../utils/limit-options";
import { adaptLegacyHandler } from "../utils/express-compat";
import type { AppBindings } from "../types/hono-bindings";

// hentaifox
import { searchHentaifox } from "../controller/hentaifox/hentaifoxSearch";
import { getHentaifox } from "../controller/hentaifox/hentaifoxGet";
import { randomHentaifox } from "../controller/hentaifox/hentaifoxRandom";

// pururin
import { getPururin } from "../controller/pururin/pururinGet";
import { searchPururin } from "../controller/pururin/pururinSearch";
import { randomPururin } from "../controller/pururin/pururinRandom";

// hentai2read
import { searchHentai2read } from "../controller/hentai2read/hentai2readSearch";
import { getHentai2read } from "../controller/hentai2read/hentai2readGet";

// simply-hentai
import { getSimplyhentai } from "../controller/simply-hentai/simply-hentaiGet";

// nhentai
import { getNhentai } from "../controller/nhentai/nhentaiGet";
import { searchNhentai } from "../controller/nhentai/nhentaiSearch";
import { relatedNhentai } from "../controller/nhentai/nhentaiRelated";
import { randomNhentai } from "../controller/nhentai/nhentaiRandom";

// asmhentai
import { getAsmhentai } from "../controller/asmhentai/asmhentaiGet";
import { searchAsmhentai } from "../controller/asmhentai/asmhentaiSearch";
import { randomAsmhentai } from "../controller/asmhentai/asmhentaiRandom";

// 3hentai
import { get3hentai } from "../controller/3hentai/3hentaiGet";
import { search3hentai } from "../controller/3hentai/3hentaiSearch";
import { random3hentai } from "../controller/3hentai/3hentaiRandom";


function scrapeRoutes(app: Hono<AppBindings>) {
  app.get("/hentaifox/search", cors(), slow, limiter, adaptLegacyHandler(searchHentaifox));
  app.get("/hentaifox/get", cors(), slow, limiter, adaptLegacyHandler(getHentaifox));
  app.get("/hentaifox/random", cors(), slow, limiter, adaptLegacyHandler(randomHentaifox));
  app.get("/pururin/get", cors(), slow, limiter, adaptLegacyHandler(getPururin));
  app.get("/pururin/search", cors(), slow, limiter, adaptLegacyHandler(searchPururin));
  app.get("/pururin/random", cors(), slow, limiter, adaptLegacyHandler(randomPururin));
  app.get("/hentai2read/search", cors(), slow, limiter, adaptLegacyHandler(searchHentai2read));
  app.get("/hentai2read/get", cors(), slow, limiter, adaptLegacyHandler(getHentai2read));
  app.get("/simply-hentai/get", cors(), slow, limiter, adaptLegacyHandler(getSimplyhentai));
  app.get("/asmhentai/get", cors(), slow, limiter, adaptLegacyHandler(getAsmhentai));
  app.get("/asmhentai/search", cors(), slow, limiter, adaptLegacyHandler(searchAsmhentai));
  app.get("/asmhentai/random", cors(), slow, limiter, adaptLegacyHandler(randomAsmhentai));
  app.get("/nhentai/get", cors(), slow, limiter, adaptLegacyHandler(getNhentai));
  app.get("/nhentai/search", cors(), slow, limiter, adaptLegacyHandler(searchNhentai));
  app.get("/nhentai/related", cors(), slow, limiter, adaptLegacyHandler(relatedNhentai));
  app.get("/nhentai/random", cors(), slow, limiter, adaptLegacyHandler(randomNhentai));
  app.get("/3hentai/get", cors(), slow, limiter, adaptLegacyHandler(get3hentai));
  app.get("/3hentai/search", cors(), slow, limiter, adaptLegacyHandler(search3hentai));
  app.get("/3hentai/random", cors(), slow, limiter, adaptLegacyHandler(random3hentai));
}

export default scrapeRoutes;