import { scrapeContent } from "../../scraper/pururin/pururinGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { getIdRandomPururin, maybeError } from "../../utils/modifier";
import { Request, Response } from "express";

export async function randomPururin(req: Request, res: Response) {
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
     * curl -i https://janda.sinkaroid.org/pururin/random
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.sinkaroid.org/pururin/random")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.sinkaroid.org/pururin/random") as resp:
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
  } catch (err) {
    const e = err as Error;
    res.status(400).json(maybeError(false, e.message));
  }
}