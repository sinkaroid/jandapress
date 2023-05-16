import { scrapeContent } from "../../scraper/nhentaito/nhentaiToSearchController";
import { logger } from "../../utils/logger";
import { maybeError } from "../../utils/modifier";
import c from "../../utils/options";
import { Request, Response } from "express";

export async function searchNhentaiTo(req: Request, res: Response) {
  try {
    const key = req.query.key || "";
    const page = req.query.page || 1;
    if (!key) throw Error("Parameter key is required");

    /**
     * @api {get} /nhentaito/search Search nhentai.to
     * @apiName Search nhentai.to
     * @apiGroup nhentai.to
     * @apiDescription Search doujinshi on nhentai.to
     * @apiParam {String} key Keyword to search
     * @apiParam {Number} [page=1] Page number
     * 
     * @apiSuccessExample {json} Success-Response:
     *    HTTP/1.1 200 OK
     *    HTTP/1.1 400 Bad Request
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.sinkaroid.org/nhentaito/search?key=yuri
     * curl -i https://janda.sinkaroid.org/nhentaito/search?key=yuri&page=2
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.sinkaroid.org/nhentaito/search?key=yuri")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.sinkaroid.org/nhentaito/search?key=yuri") as resp:
     *    print(await resp.json())
     */

    const url = `${c.NHENTAI_TO}/search?q=${key}&page=${page}`;
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