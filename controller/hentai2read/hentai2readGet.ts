import { scrapeContent } from "../../scraper/hentai2read/hentai2readGetController";
import c from "../../utils/options";
import { logger } from "../../utils/logger";

export async function getHentai2read(req: any, res: any) {
  try {
    const book = req.query.book || "";
    //if book not following format "abc/1", trhow error
    if (book.split("/").length !== 2) throw Error("Book must be in format 'book_example/chapter'. Example: 'fate_lewd_summoning/1'");
    const url = `${c.HENTAI2READ}/${book}/`;
    const data = await scrapeContent(url);
    return res.json(data);
  } catch (err: any) {
    const example = {
      "success": false,
      "message": err.message
    };
    res.json(example);
  }
}
