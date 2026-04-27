import p from "phin";
import * as dotenv from "dotenv";
import { nhentaiHeaders } from "../src/utils/modifier";

dotenv.config();

async function test() {
  const res = await p({
    url: "https://nhentai.net/api/v2/galleries?page=1&per_page=1",
    headers: nhentaiHeaders(),
  });
  
  console.log(res.statusCode);
}

test().catch(console.error);
