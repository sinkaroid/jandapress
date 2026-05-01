import type { MiddlewareHandler } from "hono";
import type { HeaderReader } from "../interfaces/header-reader";
import type { AppBindings } from "../types/hono-bindings";

type Counter = { count: number; resetAt: number };

const WINDOW_MS = 15 * 60 * 1000;
const LIMIT_MAX = 50;
const SLOW_DELAY_AFTER = 50;
const SLOW_DELAY_MS = 1000;
const SLOW_MAX_DELAY_MS = 20000;
const BUCKET_MAX_SIZE = 50000;
const SWEEP_MS = 30000;
const buckets = new Map<string, Counter>();

function getIp(headers: HeaderReader): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

function touch(key: string): Counter {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    const fresh = { count: 1, resetAt: now + WINDOW_MS };
    buckets.set(key, fresh);
    return fresh;
  }
  current.count += 1;
  return current;
}

function sweepExpiredBuckets() {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

setInterval(sweepExpiredBuckets, SWEEP_MS).unref();

const slow: MiddlewareHandler<AppBindings> = async (c, next) => {
  if (c.req.method === "OPTIONS") {
    await next();
    return;
  }
  if (buckets.size > BUCKET_MAX_SIZE) sweepExpiredBuckets();
  const key = `slow:${getIp(c.req.raw.headers)}:${c.req.path}`;
  const bucket = touch(key);
  if (bucket.count > SLOW_DELAY_AFTER) {
    const steps = bucket.count - SLOW_DELAY_AFTER;
    const wait = Math.min(steps * SLOW_DELAY_MS, SLOW_MAX_DELAY_MS);
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  await next();
};

const limiter: MiddlewareHandler<AppBindings> = async (c, next) => {
  if (c.req.method === "OPTIONS") {
    await next();
    return;
  }
  if (buckets.size > BUCKET_MAX_SIZE) sweepExpiredBuckets();
  const key = `limit:${getIp(c.req.raw.headers)}:${c.req.path}`;
  const bucket = touch(key);
  const remaining = Math.max(0, LIMIT_MAX - bucket.count);
  c.header("X-RateLimit-Limit", String(LIMIT_MAX));
  c.header("X-RateLimit-Remaining", String(remaining));
  c.header("X-RateLimit-Reset", String(Math.floor(bucket.resetAt / 1000)));
  if (bucket.count > LIMIT_MAX) {
    const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - Date.now()) / 1000));
    c.header("Retry-After", String(retryAfterSec));
    return c.json({ message: "Too nasty, please slow down" }, 429);
  }
  await next();
};

export { limiter, slow };