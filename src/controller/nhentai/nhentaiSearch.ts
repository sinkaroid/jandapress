import { scrapeContent } from "../../scraper/nhentai/nhentaiSearchController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";
import { mock } from "../../utils/modifier";
const sorting = ["popular-today", "popular-week", "popular"];

export async function searchNhentai(req: any, res: any) {
  try {
    const key = req.query.key || "";
    const page = req.query.page || 1;
    const sort = req.query.sort || sorting[0];
    if (!key) throw Error("Parameter key is required");
    if (!sorting.includes(sort)) throw Error("Invalid short: " + sorting.join(", "));

    let actualAPI;
    if (!await mock(c.NHENTAI)) actualAPI = c.NHENTAI_IP;

    const url = `${actualAPI}/api/galleries/search?query=${key}&sort=${sort}&page=${page}`;
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
    const e = {
      "success": false,
      "message": err.message
    };
    res.json(e);
  }
}