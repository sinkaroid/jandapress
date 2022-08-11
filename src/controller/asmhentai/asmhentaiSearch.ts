import { scrapeContent } from "../../scraper/asmhentai/asmhentaiSearchController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { Request, Response, NextFunction } from "express";

export async function searchAsmhentai(req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.query.key || "";
    const page = req.query.page || 1;

    if (!key) throw Error("Parameter key is required");

    const url = `${c.ASMHENTAI}/search/?q=${key}&page=${page}`;
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