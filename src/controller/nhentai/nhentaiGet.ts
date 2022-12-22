import { scrapeContent } from "../../scraper/nhentai/nhentaiGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { mock, isNumeric } from "../../utils/modifier";
import { Request, Response } from "express";

export async function getNhentai(req: Request, res: Response) {
  try {
    const book = req.query.book as string;
    if (!book) throw Error("Parameter book is required");
    if (!isNumeric(book)) throw Error("Parameter book must be number");

    let actualAPI;
    if (!await mock(c.NHENTAI)) actualAPI = c.NHENTAI_IP_3;
    else actualAPI = c.NHENTAI;

    /**
     * @api {get} /nhentai/get?book=:book Get nhentai
     * @apiName Get nhentai
     * @apiGroup nhentai
     * @apiDescription Get a doujinshi on nhentai based on id
     * 
     * @apiParam {Number} book Book ID
     * 
     * @apiSuccessExample {json} Success-Response:
     *   HTTP/1.1 200 OK
     *   HTTP/1.1 200 (cached)
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.mod.land/nhentai/get?book=123
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.mod.land/nhentai/get?book=123")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.mod.land/nhentai/get?book=123") as resp:
     *    print(await resp.json())
     */
    
    const url = `${actualAPI}/api/gallery/${book}`;
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
    const e = {
      "success": false,
      "message": err.message
    };
    res.json(e);
  }
}
