import { scrapeContent } from "../../scraper/nhentai/nhentaiGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { mock } from "../../utils/modifier";
import { getIdRandomNhentai } from "../../utils/modifier";
import { Request, Response, NextFunction } from "express";

export async function randomNhentai(req: Request, res: Response, next: NextFunction) {
  try {
    let actualAPI;
    if (!await mock(c.NHENTAI)) actualAPI = c.NHENTAI_IP_3;
    else actualAPI = c.NHENTAI;

    const id = await getIdRandomNhentai();

    /**
     * @api {get} /nhentai/random Random nhentai
     * @apiName Random nhentai
     * @apiGroup nhentai
     * @apiDescription Gets random doujinshi on nhentai
     * 
     * @apiSuccessExample {json} Success-Response:
     *   HTTP/1.1 200 OK
     *   HTTP/1.1 200 (cached)
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.mod.land/nhentai/random
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.mod.land/nhentai/random")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.mod.land/nhentai/random") as resp:
     *    print(await resp.json())
     * 
     */

    const url = `${actualAPI}/api/gallery/${id}`;
    const data = await scrapeContent(url, true);
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
