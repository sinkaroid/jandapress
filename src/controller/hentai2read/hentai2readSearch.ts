import { scrapeContent } from "../../scraper/hentai2read/hentai2readSearchController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { maybeError } from "../../utils/modifier";
import { Request, Response } from "express";

export async function searchHentai2read(req: Request, res: Response) {
  try {
    const key = req.query.key || "";
    if (!key) throw Error("Parameter book is required");

    /**
     * @api {get} /hentai2read/search Search hentai2read
     * @apiName Search hentai2read
     * @apiGroup hentai2read
     * @apiDescription Search doujinshi on hentai2read
     * @apiParam {String} key Keyword to search
     * 
     * @apiSuccessExample {json} Success-Response:
     *    HTTP/1.1 200 OK
     *    HTTP/1.1 400 Bad Request
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.sinkaroid.org/hentai2read/search?key=yuri
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.sinkaroid.org/hentai2read/search?key=yuri")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.sinkaroid.org/hentai2read/search?key=yuri") as resp:
     *    print(await resp.json())
     */
    
    const url = `${c.HENTAI2READ}/hentai-list/search/${key}`;
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