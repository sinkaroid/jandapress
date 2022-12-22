import { scrapeContent } from "../../scraper/pururin/pururinSearchController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
const sorting = ["newest", "most-popular", "highest-rated", "most-viewed", "title", "random"];
import { Request, Response, NextFunction } from "express";

export async function searchPururin(req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.query.key as string;
    const page = req.query.page || 1;
    const sort = req.query.sort as string || sorting[0] as string;
    if (!key) throw Error("Parameter key is required");
    if (!sorting.includes(sort)) throw Error("Invalid sort: " + sorting.join(", "));

    /**
     * @api {get} /pururin/search Search pururin
     * @apiName Search pururin
     * @apiGroup pururin
     * @apiDescription Search doujinshi on pururin
     * @apiParam {String} key Keyword to search
     * @apiParam {Number} [page=1] Page number
     * @apiParam {String} [sort=newest] 
     * 
     * @apiSuccessExample {json} Success-Response:
     *    HTTP/1.1 200 OK
     *    HTTP/1.1 200 (cached)
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.mod.land/pururin/search?key=yuri
     * curl -i https://janda.mod.land/pururin/search?key=yuri&page=2&sort=newest
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.mod.land/pururin/search?key=yuri")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.mod.land/pururin/search?key=yuri") as resp:
     *    print(await resp.json())
     */
    
    const url = `${c.PURURIN}/search/${sort}?q=${key}&page=${page}`;
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