import { scrapeContent } from "../../scraper/nhentai/nhentaiGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { mock } from "../../utils/modifier";
import { getIdRandomNhentai } from "../../utils/modifier";

export async function randomNhentai(req: any, res: any, next: any) {
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
