import { scrapeContent } from "../../scraper/simply-hentai/simply-hentaiGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { mock, maybeError } from "../../utils/modifier";
import { Request, Response } from "express";

export async function getSimplyhentai(req: Request, res: Response) {
  try {
    const book = req.query.book as string;
    if (!book) throw Error("Parameter book is required, Example: idolmaster/from-fumika-fc8496c/all-pages");

    let actualAPI;
    if (!await mock(c.SIMPLY_HENTAI)) actualAPI = c.SIMPLY_HENTAI_PROXIFIED;

    /**
     * @api {get} /simply-hentai/get?book=:book Get simply-hentai
     * @apiName Get simply-hentai
     * @apiGroup simply-hentai
     * @apiDescription Get a doujinshi on simply-hentai
     * 
     * @apiParam {String} book Book path
     * 
     * @apiSuccessExample {json} Success-Response:
     *   HTTP/1.1 200 OK
     *   HTTP/1.1 400 Bad Request
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.sinkaroid.org/simply-hentai/get?book=fate-grand-order/fgo-sanbunkatsuhou/all-pages
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.sinkaroid.org/simply-hentai/get?book=fate-grand-order/fgo-sanbunkatsuhou/all-pages")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.sinkaroid.org/simply-hentai/get?book=fate-grand-order/fgo-sanbunkatsuhou/all-pages") as resp:
     *    print(await resp.json())
     */
    
    const url = `${actualAPI}/${book}`;
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
