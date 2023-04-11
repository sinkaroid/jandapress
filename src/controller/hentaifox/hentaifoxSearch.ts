import { scrapeContent } from "../../scraper/hentaifox/hentaifoxSearchController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { maybeError } from "../../utils/modifier";
const sorting = ["latest", "popular"];
import { Request, Response } from "express";

export async function searchHentaifox(req: Request, res: Response) {
  try {
    /**
     * @api {get} /hentaifox/search Search hentaifox
     * @apiName Search hentaifox
     * @apiGroup hentaifox
     * @apiDescription Search doujinshi on hentaifox
     * @apiParam {String} key Keyword to search
     * @apiParam {Number} [page=1] Page number
     * @apiParam {String} [sort=latest] 
     * 
     * @apiSuccessExample {json} Success-Response:
     *    HTTP/1.1 200 OK
     *    HTTP/1.1 400 Bad Request
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.sinkaroid.org/hentaifox/search?key=yuri
     * curl -i https://janda.sinkaroid.org/hentaifox/search?key=yuri&page=2&sort=latest
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.sinkaroid.org/hentaifox/search?key=yuri")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.sinkaroid.org/hentaifox/search?key=yuri") as resp:
     *    print(await resp.json())
     */

    const key = req.query.key as string;
    const page = req.query.page || 1;
    const sort = req.query.sort as string || sorting[0] as string;
    if (!key) throw Error("Parameter key is required");
    if (!sorting.includes(sort)) throw Error("Invalid sort: " + sorting.join(", "));
    const url = `${c.HENTAIFOX}/search/?q=${key}&sort=${sort}&page=${page}`;
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