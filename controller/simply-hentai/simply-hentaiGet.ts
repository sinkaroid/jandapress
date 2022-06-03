import { scrapeContent } from "../../scraper/simply-hentai/simply-hentaiGetController";
import c from "../../utils/options";

export async function getSimplyhentai(req: any, res: any) {
  try {
    const book = req.query.book || "";
    // if (book.split("/").length !== 2) throw Error("Book must be in format 'book_example/chapter'. Example: 'fate_lewd_summoning/1'");
    const url = `${c.SIMPLY_HENTAI_PROXIFIED}/${book}`;
    console.log(url);
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
