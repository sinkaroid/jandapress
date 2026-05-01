import { Hono } from "hono";
import { swaggerUI } from "@hono/swagger-ui";
import JandaPress from "./JandaPress";
import type { HeaderReader } from "./interfaces/header-reader";
import type { AppBindings } from "./types/hono-bindings";
import scrapeRoutes from "./router/endpoint";
import { openAPISpec } from "./lib/openapi-spec";
import { slow, limiter } from "./utils/limit-options";
import { logger } from "./utils/logger";
import { isNumeric } from "./utils/modifier";
import * as pkg from "../package.json";

const janda = new JandaPress();
const app = new Hono<AppBindings>();

function getIp(headers: HeaderReader): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}


app.get("/", slow, limiter, async (c) => {
  const data = {
    success: true,
    message: "Hi, I'm alive!",
    endpoint: "https://github.com/sinkaroid/jandapress/blob/master/README.md#routing",
    date: new Date().toLocaleString(),
    rss: janda.currentProccess().rss,
    heap: janda.currentProccess().heap,
    server: await janda.getServer(),
    version: `${pkg.version}`,
  };
  logger.info({
    path: c.req.path,
    method: c.req.method,
    ip: getIp(c.req.raw.headers),
    useragent: c.req.header("User-Agent")
  });
  return c.json(data);
});

app.get("/doc", (c) => c.json(openAPISpec));
app.get("/playground", swaggerUI({ url: "/doc" }));

scrapeRoutes(app);

app.get("/g/:id", slow, limiter, (c) => {
  const id = c.req.param("id");

  if (!isNumeric(id)) return c.json({ message: "This path need required number to work" }, 400);

  return c.redirect(`https://nhentai.net/g/${id}`, 301);
});

app.get("/p/:id", slow, limiter, (c) => {
  const id = c.req.param("id");

  if (!isNumeric(id)) return c.json({ message: "This path need required number to work" }, 400);

  return c.redirect(`https://pururin.to/gallery/${id}/re=janda`, 301);
});

app.get("/h/:id", slow, limiter, (c) => {
  const id = c.req.param("id");

  if (!isNumeric(id)) return c.json({ message: "This path need required number to work" }, 400);

  return c.redirect(`https://hentaifox.com/gallery/${id}`, 301);
});

app.get("/a/:id", slow, limiter, (c) => {
  const id = c.req.param("id");

  if (!isNumeric(id)) return c.json({ message: "This path need required number to work" }, 400);

  return c.redirect(`https://asmhentai.com/g/${id}`, 301);
});

app.notFound((c) => {
  const message = `The page not found in path ${c.req.path} and method ${c.req.method}`;
  logger.error({
    path: c.req.path,
    method: c.req.method,
    ip: getIp(c.req.raw.headers),
    useragent: c.req.header("User-Agent")
  });
  return c.json({ message }, 404);
});

app.onError((error, c) => {
  logger.error({
    path: c.req.path,
    method: c.req.method,
    ip: getIp(c.req.raw.headers),
    useragent: c.req.header("User-Agent"),
    message: error.message,
    stack: error.stack
  });
  return c.json({
    message: error.message
  }, 500);
});

const port = Number(process.env.PORT || 3000);

console.log(`${pkg.name} is running on port ${port}`);

export default {
  fetch: app.fetch,
  port
};
