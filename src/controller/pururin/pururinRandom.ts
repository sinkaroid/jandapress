import { scrapeContent } from "../../scraper/pururin/pururinGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { getIdRandomPururin } from "../../utils/modifier";

export async function randomPururin(req: any, res: any, next: any) {
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