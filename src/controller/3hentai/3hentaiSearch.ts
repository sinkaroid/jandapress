import { scrapeContent } from "../../scraper/3hentai/3hentaiSearchController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { Request, Response, NextFunction } from "express";
const sorting = ["recent", "popular-24h", "popular-7d", "popular"];

export async function search3hentai(req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.query.key || "";
    const page = req.query.page || 1;
    const sort = req.query.sort as string || sorting[0] as string;
    if (!key) throw Error("Parameter key is required");
    if (!sorting.includes(sort)) throw Error("Invalid sort: " + sorting.join(", "));

    const url = `${c.THREEHENTAI}/search?q=${key}&page=${page}&sort=${sort}`;
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