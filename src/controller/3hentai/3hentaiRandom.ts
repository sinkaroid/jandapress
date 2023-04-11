import { scrapeContent } from "../../scraper/3hentai/3hentaiGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { Request, Response } from "express";
import { maybeError } from "../../utils/modifier";

export async function random3hentai(req: Request, res: Response) {
  try {
    /**
     * @api {get} /3hentai/random Random 3hentai
     * @apiName Random 3hentai
     * @apiGroup 3hentai
     * @apiDescription Gets random doujinshi on 3hentai
     * 
     * @apiSuccessExample {json} Success-Response:
     *   HTTP/1.1 200 OK
     *   HTTP/1.1 400 Bad Request
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.sinkaroid.org/3hentai/random
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.sinkaroid.org/3hentai/random")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.sinkaroid.org/3hentai/random") as resp:
     *    print(await resp.json())
     * 
     */
    
    const url = `${c.THREEHENTAI}/random`;
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
