import { scrapeContent } from "../../scraper/nhentai/nhentaiGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";

export async function getNhentai(req: any, res: any) {
  try {
    const book = req.query.book || "";
    const url = `${c.NHENTAI_IP}/api/gallery/${book}`;
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
    const example = {
      "success": false,
      "message": err.message
    };
    res.json(example);
  }
}
