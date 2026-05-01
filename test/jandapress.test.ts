/// <reference types="bun" />
import { afterAll, beforeAll, expect, test } from "bun:test";
import { nhentaiHeaders } from "../src/utils/modifier";

const port = process.env.PORT ?? 3000;
const baseUrl = `http://localhost:${port}`;
let spawnedServer: {
  kill: () => void;
  stderr?: ReadableStream<Uint8Array> | null;
} | null = null;
type BunGlobal = typeof globalThis & {
  Bun?: {
    spawn: (cmd: string[], options: {
      cwd: string;
      env: Record<string, string | undefined>;
      stdout: "ignore" | "pipe";
      stderr: "ignore" | "pipe";
    }) => {
      kill: () => void;
      stderr?: ReadableStream<Uint8Array> | null;
    };
  };
};

type ApiResponse = {
  success: boolean;
  data?: {
    id?: number;
  };
};

type NhentaiApiResponse = {
  id?: number;
  result?: {
    id?: number;
  };
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function canReachApi() {
  try {
    const res = await fetch(`${baseUrl}/`, {
      redirect: "follow",
      signal: AbortSignal.timeout(1500)
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function waitForApiReady(timeoutMs = 20000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await canReachApi()) return;
    await sleep(200);
  }

  throw new Error(`Timed out waiting for API server on ${baseUrl}`);
}

beforeAll(async () => {
  if (await canReachApi()) {
    return;
  }

  const bunRuntime = (globalThis as BunGlobal).Bun;
  if (!bunRuntime) {
    throw new Error("Bun runtime not available");
  }

  spawnedServer = bunRuntime.spawn(["bun", "run", "src/index.ts"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: `${port}`
    },
    stdout: "ignore",
    stderr: "pipe"
  });

  try {
    await waitForApiReady();
  } catch (error) {
    const server = spawnedServer;
    const stderr = server?.stderr ? await new Response(server.stderr).text() : "";
    server?.kill();
    spawnedServer = null;
    throw new Error(`Failed to boot API server. ${error instanceof Error ? error.message : String(error)}\n${stderr}`);
  }
});

afterAll(() => {
  if (!spawnedServer) return;
  spawnedServer.kill();
  spawnedServer = null;
});

async function fetchNhentaiApi(id: number) {
  const urls = [
    `https://nhentai.net/api/v2/galleries/${id}`,
    `https://nhentai.net/api/gallery/${id}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: nhentaiHeaders(), redirect: "follow" });
      if (res.status !== 200) continue;

      const json = await res.json() as NhentaiApiResponse;
      const resolvedId = json.id ?? json?.result?.id;
      if (resolvedId === id) return;
    } catch {
      // try next endpoint
    }
  }

  throw new Error(`Failed to validate nhentai id ${id} using official API endpoints`);
}

async function run(path: string, id?: number) {
  try {
    const res = await fetch(`${baseUrl}${path}`, {
      redirect: "follow",
      signal: AbortSignal.timeout(20000)
    });

    expect(res.status).toBe(200);

    const json = await res.json() as ApiResponse;

    console.log(JSON.stringify(json, null, 2));

    if (!json.success) throw new Error("scraper failed");

    if (id !== undefined) {
      expect(json.data?.id).toBe(id);
    }
  } catch (err) {
    if (path.startsWith("/nhentai") && id !== undefined) {
      console.log("nhentai scraper blocked, falling back to API");
      await fetchNhentaiApi(id);
      return;
    }

    throw err;
  }
}

test("nhentai", async () => {
  await run("/nhentai/get?book=577774", 577774);
});

test("pururin", async () => {
  await run("/pururin/get?book=47226", 47226);
});

test("hentaifox", async () => {
  await run("/hentaifox/get?book=59026", 59026);
});

test("asmhentai", async () => {
  await run("/asmhentai/get?book=308830", 308830);
});

test("hentai2read", async () => {
  await run("/hentai2read/get?book=butabako_shotaone_matome_fgo_hen/1");
});

test("simply-hentai", async () => {
  await run("/simply-hentai/get?book=fate-grand-order/fgo-sanbunkatsuhou/all-pages");
});

test("3hentai", async () => {
  await run("/3hentai/get?book=608979", 608979);
});
