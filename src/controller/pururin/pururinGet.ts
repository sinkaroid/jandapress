import { scrapeContent } from "../../scraper/pururin/pururinGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { isNumeric } from "../../utils/modifier";
import { Request, Response, NextFunction } from "express";

export async function getPururin(req: Request, res: Response, next: NextFunction) {
  try {
    const book = req.query.book as string;
    if (!book) throw Error("Parameter book is required");
    if (!isNumeric(book)) throw Error("Parameter book must be number");

    /**
     * @api {get} /pururin/get?book=:book Get pururin
     * @apiName Get pururin
     * @apiGroup pururin
     * @apiDescription Get a doujinshi on pururin based on id
     * 
     * @apiParam {Number} book Book ID
     * 
     * @apiSuccessExample {json} Success-Response:
     *   HTTP/1.1 200 OK
     *   HTTP/1.1 400 Bad Request
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.mod.land/pururin/get?book=123
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.mod.land/pururin/get?book=123")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.mod.land/pururin/get?book=123") as resp:
     *    print(await resp.json())
     */

    const url = `${c.PURURIN}/gallery/${book}/janda`;
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
    next(Error(err.message));
  }
}