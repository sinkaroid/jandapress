import "dotenv/config";
import JandaPress from "./JandaPress";
import express from "express";
import { Request, Response, NextFunction } from "express";
import scrapeRoutes from "./router/endpoint";
import { slow, limiter } from "./utils/limit-options";
import { logger } from "./utils/logger";
import { isNumeric } from "./utils/modifier";
import * as pkg from "../package.json";

const janda = new JandaPress();
const app = express();


app.get("/", slow, limiter, async (req, res) => {
  res.send({
    success: true,
    message: "Hi, I'm alive!",
    endpoint: "https://github.com/sinkaroid/jandapress/blob/master/README.md#routing",
    date: new Date().toLocaleString(),
    rss: janda.currentProccess().rss,
    heap: janda.currentProccess().heap,
    server: await janda.getServer(),
    version: `${pkg.version}`,
  });
  logger.info({
    path: req.path,
    method: req.method,
    ip: req.ip,
    useragent: req.get("User-Agent")
  });
});

app.use(scrapeRoutes());

app.get("/g/:id", slow, limiter, (req, res) => {
  if (!isNumeric(req.params.id)) throw Error("This path need required number to work");
  res.redirect(301, `https://nhentai.net/g/${req.params.id}`);
});

app.get("/p/:id", slow, limiter, (req, res) => {
  if (!isNumeric(req.params.id)) throw Error("This path need required number to work");
  res.redirect(301, `https://pururin.to/gallery/${req.params.id}/re=janda`);
});

app.get("/h/:id", slow, limiter, (req, res) => {
  if (!isNumeric(req.params.id)) throw Error("This path need required number to work");
  res.redirect(301, `https://hentaifox.com/gallery/${req.params.id}`);
});

app.get("/a/:id", slow, limiter, (req, res) => {
  if (!isNumeric(req.params.id)) throw Error("This path need required number to work");
  res.redirect(301, `https://asmhentai.com/g/${req.params.id}`);
});

app.get("/to/:id", slow, limiter, (req, res) => {
  if (!isNumeric(req.params.id)) throw Error("This path need required number to work");
  res.redirect(301, `https://nhentai.to/g/${req.params.id}`);
});

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404);
  next(Error(`The page not found in path ${req.url} and method ${req.method}`));
  logger.error({
    path: req.url,
    method: req.method,
    ip: req.ip,
    useragent: req.get("User-Agent")
  });
});

app.use((error: any, res: Response) => {
  res.status(500).json({
    message: error.message,
    stack: error.stack
  });
});


app.listen(process.env.PORT || 3000, () => console.log(`${pkg.name} is running on port ${process.env.PORT || 3000}`));