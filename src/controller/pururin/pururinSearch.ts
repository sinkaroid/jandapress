import { scrapeContent } from "../../scraper/pururin/pururinSearchController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
const sorting = ["newest", "most-popular", "highest-rated", "most-viewed", "title", "random"];

export async function searchPururin(req: any, res: any, next: any) {
  try {
    const key = req.query.key || "";
    const page = req.query.page || 1;
    const sort = req.query.sort || sorting[0];
    if (!key) throw Error("Parameter key is required");
    if (!sorting.includes(sort)) throw Error("Invalid short: " + sorting.join(", "));
    const url = `${c.PURURIN}/search/${sort}?q=${key}&page=${page}`;
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