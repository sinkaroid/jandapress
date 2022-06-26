import { scrapeContent } from "../../scraper/asmhentai/asmhentaiGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";

export async function randomAsmhentai(req: any, res: any, next: any) {
  try {
    const url = `${c.ASMHENTAI}/random`;
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
