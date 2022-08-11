import { scrapeContent } from "../../scraper/nhentai/nhentaiRelatedController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { mock, isNumeric } from "../../utils/modifier";
import { Request, Response } from "express";

export async function relatedNhentai(req: Request, res: Response) {
  try {
    const book = req.query.book as string;
    if (!book) throw Error("Parameter book is required");
    if (!isNumeric(book)) throw Error("Value must be number");

    let actualAPI;
    if (!await mock(c.NHENTAI)) actualAPI = c.NHENTAI_IP;
    else actualAPI = c.NHENTAI;
    
    const url = `${actualAPI}/api/gallery/${book}/related`;
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
