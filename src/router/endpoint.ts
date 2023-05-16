import { Router } from "express";
import cors from "cors";
import { slow, limiter } from "../utils/limit-options";

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

// nhentaito
import { getNhentaiTo } from "../controller/nhentaito/nhentaiToGet";
import { randomNhentaiTo } from "../controller/nhentaito/nhentaiToRandom";
import { searchNhentaiTo } from "../controller/nhentaito/nhentaiToSearch";
import { relatedNhentaiTo } from "../controller/nhentaito/nhentaiToRelated";


function scrapeRoutes() {
  const router = Router();
  router.get("/hentaifox/search", cors(), slow, limiter, searchHentaifox);
  router.get("/hentaifox/get", cors(), slow, limiter, getHentaifox);
  router.get("/hentaifox/random", cors(), slow, limiter, randomHentaifox);
  router.get("/pururin/get", cors(), slow, limiter, getPururin);
  router.get("/pururin/search", cors(), slow, limiter, searchPururin);
  router.get("/pururin/random", cors(), slow, limiter, randomPururin);
  router.get("/hentai2read/search", cors(), slow, limiter, searchHentai2read);
  router.get("/hentai2read/get", cors(), slow, limiter, getHentai2read);
  router.get("/simply-hentai/get", cors(), slow, limiter, getSimplyhentai);
  router.get("/asmhentai/get", cors(), slow, limiter, getAsmhentai);
  router.get("/asmhentai/search", cors(), slow, limiter, searchAsmhentai);
  router.get("/asmhentai/random", cors(), slow, limiter, randomAsmhentai);
  router.get("/nhentai/get", cors(), slow, limiter, getNhentai);
  router.get("/nhentai/search", cors(), slow, limiter, searchNhentai);
  router.get("/nhentai/related", cors(), slow, limiter, relatedNhentai);
  router.get("/nhentai/random", cors(), slow, limiter, randomNhentai);
  router.get("/3hentai/get", cors(), slow, limiter, get3hentai);
  router.get("/3hentai/search", cors(), slow, limiter, search3hentai);
  router.get("/3hentai/random", cors(), slow, limiter, random3hentai);
  router.get("/nhentaito/get", cors(), slow, limiter, getNhentaiTo);
  router.get("/nhentaito/random", cors(), slow, limiter, randomNhentaiTo);
  router.get("/nhentaito/search", cors(), slow, limiter, searchNhentaiTo);
  router.get("/nhentaito/related", cors(), slow, limiter, relatedNhentaiTo);

  return router;
}

export default scrapeRoutes;