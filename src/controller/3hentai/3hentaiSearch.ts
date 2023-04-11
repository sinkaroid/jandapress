import { scrapeContent } from "../../scraper/3hentai/3hentaiSearchController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { maybeError } from "../../utils/modifier";
import { Request, Response } from "express";
const sorting = ["recent", "popular-24h", "popular-7d", "popular"];

export async function search3hentai(req: Request, res: Response) {
  try {
    const key = req.query.key || "";
    const page = req.query.page || 1;
    const sort = req.query.sort as string || sorting[0] as string;
    if (!key) throw Error("Parameter key is required");
    if (!sorting.includes(sort)) throw Error("Invalid sort: " + sorting.join(", "));

    /**
     * @api {get} /3hentai/search Search 3hentai
     * @apiName Search 3hentai
     * @apiGroup 3hentai
     * @apiDescription Search doujinshi on 3hentai
     * @apiParam {String} key Keyword to search
     * @apiParam {Number} [page=1] Page number
     * @apiParam {String} [sort=recent] 
     * 
     * @apiSuccessExample {json} Success-Response:
     *    HTTP/1.1 200 OK
     *    HTTP/1.1 400 Bad Request
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.sinkaroid.org/3hentai/search?key=yuri
     * curl -i https://janda.sinkaroid.org/3hentai/search?key=yuri&page=2&sort=recent
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.sinkaroid.org/3hentai/search?key=yuri")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.sinkaroid.org/3hentai/search?key=yuri") as resp:
     *    print(await resp.json())
     */

    const url = `${c.THREEHENTAI}/search?q=${key}&page=${page}&sort=${sort}`;
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