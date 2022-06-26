import { scrapeContent } from "../../scraper/pururin/pururinGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";

export async function getPururin(req: any, res: any, next: any) {
  try {
    const book = req.query.book || "";
    if (!book) throw Error("Parameter book is required");
    if (isNaN(book)) throw Error("Value must be number");
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