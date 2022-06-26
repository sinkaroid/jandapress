import { scrapeContent } from "../../scraper/simply-hentai/simply-hentaiGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { mock } from "../../utils/modifier";

export async function getSimplyhentai(req: any, res: any) {
  try {
    const book = req.query.book || "";
    if (!book) throw Error("Parameter book is required");

    let actualAPI;
    if (!await mock(c.SIMPLY_HENTAI)) actualAPI = c.SIMPLY_HENTAI_PROXIFIED;
    
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
  } catch (err: any) {
    const example = {
      "success": false,
      "message": err.message
    };
    res.json(example);
  }
}
