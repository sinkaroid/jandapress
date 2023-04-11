import { scrapeContent } from "../../scraper/hentai2read/hentai2readGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { maybeError } from "../../utils/modifier";
import { Request, Response } from "express";

export async function getHentai2read(req: Request, res: Response) {
  try {
    const book = req.query.book as string;
    if (!book) throw Error("Parameter book is required");
    if (book.split("/").length !== 2) throw Error("Book must be in format 'book_example/chapter'. Example: 'fate_lewd_summoning/1'");
    
    /**
     * @api {get} /hentai2read/get?book=:book Get hentai2read
     * @apiName Get hentai2read
     * @apiGroup hentai2read
     * @apiDescription Get a doujinshi on hentai2read
     * 
     * @apiParam {String} book Book path
     * 
     * @apiSuccessExample {json} Success-Response:
     *   HTTP/1.1 200 OK
     *   HTTP/1.1 400 Bad Request
     * 
     * @apiExample {curl} curl
     * curl -i https://janda.sinkaroid.org/hentai2read/get?book=butabako_shotaone_matome_fgo_hen/1
     * 
     * @apiExample {js} JS/TS
     * import axios from "axios"
     * 
     * axios.get("https://janda.sinkaroid.org/hentai2read/get?book=butabako_shotaone_matome_fgo_hen/1")
     * .then(res => console.log(res.data))
     * .catch(err => console.error(err))
     * 
     * @apiExample {python} Python
     * import aiohttp
     * async with aiohttp.ClientSession() as session:
     *  async with session.get("https://janda.sinkaroid.org/hentai2read/get?book=butabako_shotaone_matome_fgo_hen/1") as resp:
     *    print(await resp.json())
     */
    
    const url = `${c.HENTAI2READ}/${book}/`;
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
