import { Request, Response, NextFunction } from "express";
import { scrapeContent } from "../../scraper/hentaifox/hentaifoxGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";

export async function randomHentaifox(req: Request, res: Response, next: NextFunction) {
  try {
    /**
     * @api {get} /hentaifox/random Random hentaifox
     * @apiName Random hentaifox
     * @apiGroup hentaifox
     * @apiDescription Gets random doujinshi on hentaifox
     * 
     * @apiSuccessExample {json} Success-Response:
     *   HTTP/1.1 200 OK
     *   HTTP/1.1 200 (cached)
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.mod.land/hentaifox/random
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.mod.land/hentaifox/random")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.mod.land/hentaifox/random") as resp:
     *    print(await resp.json())
     * 
     */
    const url = `${c.HENTAIFOX}/random`;
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
