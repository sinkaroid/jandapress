import { scrapeContent } from "../../scraper/nhentai/nhentaiSearchController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
const sorting = ["popular-today", "popular-week", "popular"];

export async function searchNhentai(req: any, res: any, next: any) {
  try {
    const key = req.query.key || "";
    const page = req.query.page || 1;
    const sort = req.query.sort || sorting[0];
    if (!sorting.includes(sort)) throw Error("Invalid short: " + sorting.join(", "));
    const url = `${c.NHENTAI_IP}/api/galleries/search?query=${key}&sort=${sort}&page=${page}`;
    const data = await scrapeContent(url);
    logger.info({
      path: req.path,
      query: req.query,
      method: req.method,
      ip: req.ip,
      useragent: req.get("User-Agent")
    });
    console.log(url);
    return res.json(data);
  } catch (err: any) {
    next(Error(err.message));
  }
}