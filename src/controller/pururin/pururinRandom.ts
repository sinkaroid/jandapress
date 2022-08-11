import { scrapeContent } from "../../scraper/pururin/pururinGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { getIdRandomPururin } from "../../utils/modifier";
import { Request, Response, NextFunction } from "express";

export async function randomPururin(req: Request, res: Response, next: NextFunction) {
  try {
    const id = await getIdRandomPururin();
    const url = `${c.PURURIN}/gallery/${id}/janda`;
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