import { scrapeContent } from "../../scraper/nhentai/nhentaiRelatedController";
import { logger } from "../../utils/logger";
import { nhentaiStrategy, isNumeric, maybeError } from "../../utils/modifier";
import { Request, Response } from "express";

export async function relatedNhentai(req: Request, res: Response) {
  try {
    const book = req.query.book as string;
    if (!book) throw Error("Parameter book is required");
    if (!isNumeric(book)) throw Error("Value must be number");

    /**
     * @api {get} /nhentai/related?book=:book Get related nhentai
     * @apiName Get related nhentai
     * @apiGroup nhentai
     * @apiDescription Get related or similar doujinshi on nhentai based on id
     * 
     * @apiParam {Number} book Book ID
     * 
     * @apiSuccessExample {json} Success-Response:
     *   HTTP/1.1 200 OK
     *   HTTP/1.1 400 Bad Request
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.sinkaroid.org/nhentai/related?book=123
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.sinkaroid.org/nhentai/related?book=123")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.sinkaroid.org/nhentai/related?book=123") as resp:
     *    print(await resp.json())
     */
    
    const url = `${nhentaiStrategy()}/api/gallery/${book}/related`;
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
