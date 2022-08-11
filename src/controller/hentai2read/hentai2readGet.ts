import { scrapeContent } from "../../scraper/hentai2read/hentai2readGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { Request, Response } from "express";

export async function getHentai2read(req: Request, res: Response) {
  try {
    const book = req.query.book as string;
    if (!book) throw Error("Parameter book is required");
    if (book.split("/").length !== 2) throw Error("Book must be in format 'book_example/chapter'. Example: 'fate_lewd_summoning/1'");
    
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
  } catch (err: any) {
    const example = {
      "success": false,
      "message": err.message
    };
    res.json(example);
  }
}
