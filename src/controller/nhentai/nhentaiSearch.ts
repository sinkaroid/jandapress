import { scrapeContent } from "../../scraper/nhentai/nhentaiSearchController";
import { logger } from "../../utils/logger";
import { nhentaiStrategy, maybeError } from "../../utils/modifier";
const sorting = ["popular-today", "popular-week", "popular"];
import { Request, Response } from "express";

export async function searchNhentai(req: Request, res: Response) {
  try {
    const key = req.query.key || "";
    const page = req.query.page || 1;
    const sort = req.query.sort as string || sorting[0] as string;
    if (!key) throw Error("Parameter key is required");
    if (!sorting.includes(sort)) throw Error("Invalid sort: " + sorting.join(", "));

    /**
     * @api {get} /nhentai/search Search nhentai
     * @apiName Search nhentai
     * @apiGroup nhentai
     * @apiDescription Search doujinshi on nhentai
     * @apiParam {String} key Keyword to search
     * @apiParam {Number} [page=1] Page number
     * @apiParam {String} [sort=popular-today] 
     * 
     * @apiSuccessExample {json} Success-Response:
     *    HTTP/1.1 200 OK
     *    HTTP/1.1 400 Bad Request
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.sinkaroid.org/nhentai/search?key=yuri
     * curl -i https://janda.sinkaroid.org/nhentai/search?key=yuri&page=2&sort=popular-today
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.sinkaroid.org/nhentai/search?key=yuri")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.sinkaroid.org/nhentai/search?key=yuri") as resp:
     *    print(await resp.json())
     */

    const url = `${nhentaiStrategy()}/api/galleries/search?query=${key}&sort=${sort}&page=${page}`;
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