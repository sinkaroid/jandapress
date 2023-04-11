import { scrapeContent } from "../../scraper/nhentai/nhentaiGetController";
import { logger } from "../../utils/logger";
import { nhentaiStrategy, getIdRandomNhentai, maybeError } from "../../utils/modifier";
import { Request, Response } from "express";

export async function randomNhentai(req: Request, res: Response) {
  try {
    const id = await getIdRandomNhentai();

    /**
     * @api {get} /nhentai/random Random nhentai
     * @apiName Random nhentai
     * @apiGroup nhentai
     * @apiDescription Gets random doujinshi on nhentai
     * 
     * @apiSuccessExample {json} Success-Response:
     *   HTTP/1.1 200 OK
     *   HTTP/1.1 400 Bad Request
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.sinkaroid.org/nhentai/random
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.sinkaroid.org/nhentai/random")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.sinkaroid.org/nhentai/random") as resp:
     *    print(await resp.json())
     * 
     */

    const url = `${nhentaiStrategy()}/api/gallery/${id}`;
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
