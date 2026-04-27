import p from "phin";
import { nhentaiHeaders } from "../src/utils/modifier";

const url = "https://nhentai.net";

async function test() {
  const headers = nhentaiHeaders();
  console.log("[test/nh.ts] Authorization header:", headers.Authorization ? "present" : "missing");

  const res = await p({
    url: `${url}/api/v2/galleries/1`,
    parse: "json",
    headers
  });

  console.log(res.body);
}

test().catch(console.error);
