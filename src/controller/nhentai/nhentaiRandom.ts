import { scrapeContent } from "../../scraper/nhentai/nhentaiGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { mock } from "../../utils/modifier";
import { getIdRandomNhentai } from "../../utils/modifier";
import { Request, Response, NextFunction } from "express";

export async function randomNhentai(req: Request, res: Response, next: NextFunction) {
  try {
    let actualAPI;
    if (!await mock(c.NHENTAI)) actualAPI = c.NHENTAI_IP;
    else actualAPI = c.NHENTAI;

    const id = await getIdRandomNhentai();

    const url = `${actualAPI}/api/gallery/${id}`;
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
