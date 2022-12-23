import { scrapeContent } from "../../scraper/asmhentai/asmhentaiSearchController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { Request, Response, NextFunction } from "express";

export async function searchAsmhentai(req: Request, res: Response, next: NextFunction) {
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
     *    HTTP/1.1 200 (cached)
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.mod.land/asmhentai/search?key=yuri
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.mod.land/asmhentai/search?key=yuri")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.mod.land/asmhentai/search?key=yuri") as resp:
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
  } catch (err: any) {
    next(Error(err.message));
  }
}