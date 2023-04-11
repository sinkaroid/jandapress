import { scrapeContent } from "../../scraper/asmhentai/asmhentaiGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { maybeError } from "../../utils/modifier";
import { Request, Response } from "express";

export async function randomAsmhentai(req: Request, res: Response) {
  try {
    /**
     * @api {get} /asmhentai/random Random asmhentai
     * @apiName Random asmhentai
     * @apiGroup asmhentai
     * @apiDescription Gets random doujinshi on asmhentai
     * 
     * @apiSuccessExample {json} Success-Response:
     *   HTTP/1.1 200 OK
     *   HTTP/1.1 400 Bad Request
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.sinkaroid.org/asmhentai/random
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.sinkaroid.org/asmhentai/random")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.sinkaroid.org/asmhentai/random") as resp:
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
  } catch (err) {
    const e = err as Error;
    res.status(400).json(maybeError(false, e.message));
  }
}
