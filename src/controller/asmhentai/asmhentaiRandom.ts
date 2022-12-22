import { scrapeContent } from "../../scraper/asmhentai/asmhentaiGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { Request, Response, NextFunction } from "express";

export async function randomAsmhentai(req: Request, res: Response, next: NextFunction) {
  try {
    /**
     * @api {get} /asmhentai/random Random asmhentai
     * @apiName Random asmhentai
     * @apiGroup asmhentai
     * @apiDescription Gets random doujinshi on asmhentai
     * 
     * @apiSuccessExample {json} Success-Response:
     *   HTTP/1.1 200 OK
     *   HTTP/1.1 200 (cached)
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.mod.land/asmhentai/random
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.mod.land/asmhentai/random")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.mod.land/asmhentai/random") as resp:
     *    print(await resp.json())
     * 
     */
    
    const url = `${c.ASMHENTAI}/random/`;
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
