import { nhentaiHeaders } from "../src/utils/modifier";

async function test() {
  const res = await fetch("https://nhentai.net/api/v2/galleries?page=1&per_page=1", {
    headers: nhentaiHeaders(),
    redirect: "follow"
  });
  
  console.log(res.status);
}

test().catch(console.error);
