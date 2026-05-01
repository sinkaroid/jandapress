import { nhentaiHeaders } from "../src/utils/modifier";

const url = "https://nhentai.net";

async function test() {
  const headers = nhentaiHeaders();
  console.log("[test/nh.ts] Authorization header:", headers.Authorization ? "present" : "missing");

  const res = await fetch(`${url}/api/v2/galleries/1`, {
    headers,
    redirect: "follow"
  });

  console.log(await res.json());
}

test().catch(console.error);
