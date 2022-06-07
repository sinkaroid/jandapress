import { scrapeContent } from "../../scraper/nhentai/nhentaiGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
//import { mock } from "../../utils/modifier";

export async function getNhentai(req: any, res: any) {
  try {
    const book = req.query.book || "";
    if (!book) throw Error("Parameter book is required");
    if (isNaN(book)) throw Error("Value must be number");
    
    const url = `${c.NHENTAI}/api/gallery/${book}`;
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
