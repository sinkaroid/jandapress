import { scrapeContent } from "../../scraper/hentai2read/hentai2readSearchController";
import c from "../../utils/options";

export async function searchHentai2read(req: any, res: any, next: any) {
  try {
    const key = req.query.key || "";
    const url = `${c.HENTAI2READ}/hentai-list/search/${key}`;
    const data = await scrapeContent(url);
    return res.json(data);
  } catch (err: any) {
    next(Error(err.message));
  }
}