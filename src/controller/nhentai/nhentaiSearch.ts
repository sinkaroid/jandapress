import { scrapeContent } from "../../scraper/nhentai/nhentaiSearchController";
import { logger } from "../../utils/logger";
import { maybeError } from "../../utils/modifier";
import { NHENTAI_SEARCH_SORTS, nhentaiSearchUrl } from "../../utils/nhentai";
import { Request, Response } from "express";

export async function searchNhentai(req: Request, res: Response) {
  try {
    const key = req.query.key || "";
    const page = Number(req.query.page || 1);
    const sort = req.query.sort as string || NHENTAI_SEARCH_SORTS[0] as string;
    if (!key) throw Error("Parameter key is required");
    if (!Number.isInteger(page) || page < 1) throw Error("Parameter page must be positive integer");
    if (!NHENTAI_SEARCH_SORTS.includes(sort as typeof NHENTAI_SEARCH_SORTS[number])) throw Error("Invalid sort: " + NHENTAI_SEARCH_SORTS.join(", "));

    /**
     * @api {get} /nhentai/search?key=:key Search nhentai
     * @apiName Search nhentai
     * @apiGroup nhentai
     * @apiDescription Search doujinshi on nhentai
     *
     * @apiParam {String} key Keyword to search
     * @apiParam {Number} [page=1] Page number
     * @apiParam {String} [sort=popular-today] Sort type
     *
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * HTTP/1.1 400 Bad Request
     *
     * @apiExample {curl} curl
     * curl -i http://localhost:3000/nhentai/search?key=yuri
     * curl -i http://localhost:3000/nhentai/search?key=yuri&page=2&sort=popular-today
     *
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * axios.get("http://localhost:3000/nhentai/search?key=yuri")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     *
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *   async with session.get("http://localhost:3000/nhentai/search?key=yuri") as resp:
     *     print(await resp.json())
     */

    const url = nhentaiSearchUrl(String(key), page, sort);
    const data = await scrapeContent(url);
    logger.info({
      path: req.path,
      query: req.query,
      method: req.method,
      ip: req.ip,
      useragent: req.get("User-Agent")
    });
    return res.json(data);
  } catch (err) {
    const e = err as Error;
    res.status(400).json(maybeError(false, e.message));
  }
}
