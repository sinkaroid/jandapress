import { Request, Response } from "express";
import { scrapeContent } from "../../scraper/hentaifox/hentaifoxGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { maybeError } from "../../utils/modifier";

export async function randomHentaifox(req: Request, res: Response) {
  try {
    /**
     * @api {get} /hentaifox/random Random hentaifox
     * @apiName Random hentaifox
     * @apiGroup hentaifox
     * @apiDescription Gets random doujinshi on hentaifox
     * 
     * @apiSuccessExample {json} Success-Response:
     *   HTTP/1.1 200 OK
     *   HTTP/1.1 400 Bad Request
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.sinkaroid.org/hentaifox/random
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.sinkaroid.org/hentaifox/random")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.sinkaroid.org/hentaifox/random") as resp:
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
  } catch (err) {
    const e = err as Error;
    res.status(400).json(maybeError(false, e.message));
  }
}
