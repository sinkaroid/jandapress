import { scrapeContent } from "../../scraper/3hentai/3hentaiGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { Request, Response, NextFunction } from "express";

export async function random3hentai(req: Request, res: Response, next: NextFunction) {
  try {
    const url = `${c.THREEHENTAI}/random`;
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
