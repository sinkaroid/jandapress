import { scrapeContent } from "../../scraper/hentai2read/hentai2readSearchController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";

export async function searchHentai2read(req: any, res: any, next: any) {
  try {
    const key = req.query.key || "";
    if (!key) throw Error("Parameter book is required");
    const url = `${c.HENTAI2READ}/hentai-list/search/${key}`;
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