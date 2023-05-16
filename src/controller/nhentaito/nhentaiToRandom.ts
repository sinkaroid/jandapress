import { scrapeContent } from "../../scraper/nhentaito/nhentaiToGetController";
import { logger } from "../../utils/logger";
import { maybeError } from "../../utils/modifier";
import c from "../../utils/options";
import { Request, Response } from "express";

export async function randomNhentaiTo(req: Request, res: Response) {
  try {

    /**
     * @api {get} /nhentaito/random Random nhentai.to
     * @apiName Random nhentai.to
     * @apiGroup nhentai.to
     * @apiDescription Gets random doujinshi on nhentai.to
     * 
     * @apiSuccessExample {json} Success-Response:
     *   HTTP/1.1 200 OK
     *   HTTP/1.1 400 Bad Request
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.sinkaroid.org/nhentaito/random
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.sinkaroid.org/nhentaito/random")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.sinkaroid.org/nhentaito/random") as resp:
     *    print(await resp.json())
     * 
     */

    const url = `${c.NHENTAI_TO}/random/`;
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
    res.status(400).json(maybeError(false, `Error Try again: ${e.message}`));
  }
}
