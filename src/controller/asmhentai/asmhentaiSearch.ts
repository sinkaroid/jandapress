import { scrapeContent } from "../../scraper/asmhentai/asmhentaiSearchController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { maybeError } from "../../utils/modifier";
import { Request, Response } from "express";

export async function searchAsmhentai(req: Request, res: Response) {
  try {
    const key = req.query.key || "";
    const page = req.query.page || 1;

    if (!key) throw Error("Parameter key is required");

    /**
     * @api {get} /asmhentai/search Search asmhentai
     * @apiName Search asmhentai
     * @apiGroup asmhentai
     * @apiDescription Search doujinshi on asmhentai
     * @apiParam {String} key Keyword to search
     * @apiParam {Number} [page=1] Page number
     * 
     * @apiSuccessExample {json} Success-Response:
     *    HTTP/1.1 200 OK
     *    HTTP/1.1 400 Bad Request
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.sinkaroid.org/asmhentai/search?key=yuri
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.sinkaroid.org/asmhentai/search?key=yuri")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.sinkaroid.org/asmhentai/search?key=yuri") as resp:
     *    print(await resp.json())
     */

    const url = `${c.ASMHENTAI}/search/?q=${key}&page=${page}`;
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