import { scrapeContent } from "../../scraper/hentaifox/hentaifoxSearchController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
const sorting = ["latest", "popular"];
import { Request, Response, NextFunction } from "express";

export async function searchHentaifox(req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.query.key as string;
    const page = req.query.page || 1;
    const sort = req.query.sort as string || sorting[0] as string;
    if (!key) throw Error("Parameter key is required");
    if (!sorting.includes(sort)) throw Error("Invalid sort: " + sorting.join(", "));
    const url = `${c.HENTAIFOX}/search/?q=${key}&sort=${sort}&page=${page}`;
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