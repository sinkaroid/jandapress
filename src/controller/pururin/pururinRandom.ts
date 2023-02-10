import { scrapeContent } from "../../scraper/pururin/pururinGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { getIdRandomPururin } from "../../utils/modifier";
import { Request, Response, NextFunction } from "express";

export async function randomPururin(req: Request, res: Response, next: NextFunction) {
  try {
    const id = await getIdRandomPururin();
    
    /**
     * @api {get} /pururin/random Random pururin
     * @apiName Random pururin
     * @apiGroup pururin
     * @apiDescription Gets random doujinshi on pururin
     * 
     * @apiSuccessExample {json} Success-Response:
     *   HTTP/1.1 200 OK
     *   HTTP/1.1 400 Bad Request
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.mod.land/pururin/random
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.mod.land/pururin/random")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.mod.land/pururin/random") as resp:
     *    print(await resp.json())
     * 
     */
    
    const url = `${c.PURURIN}/gallery/${id}/janda`;
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