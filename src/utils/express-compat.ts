import type { Context } from "hono";
import type { LegacyRequest } from "../interfaces/legacy-request";
import type { LegacyResponse } from "../interfaces/legacy-response";
import type { LegacyHandler } from "../types/legacy-handler";
import type { AppBindings } from "../types/hono-bindings";

function getIp(c: Context<AppBindings>): string {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  const realIp = c.req.header("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

function getQuery(url: string): Record<string, string | string[]> {
  const search = new URL(url).searchParams;
  const query: Record<string, string | string[]> = {};
  for (const [key, value] of search.entries()) {
    const current = query[key];
    if (current === undefined) {
      query[key] = value;
      continue;
    }
    if (Array.isArray(current)) {
      current.push(value);
      query[key] = current;
      continue;
    }
    query[key] = [current, value];
  }
  return query;
}

export function adaptLegacyHandler(handler: LegacyHandler) {
  return async (c: Context<AppBindings>) => {
    let statusCode = 200;
    const headers: Record<string, string> = {};
    let response: Response | undefined;

    const req: LegacyRequest = {
      query: getQuery(c.req.url),
      params: c.req.param(),
      path: c.req.path,
      method: c.req.method,
      ip: getIp(c),
      url: new URL(c.req.url).pathname + new URL(c.req.url).search,
      get(name: string) {
        return c.req.header(name);
      },
    };

    const res: LegacyResponse = {
      status(code: number) {
        statusCode = code;
        return res;
      },
      set(field: string, value: string) {
        headers[field] = value;
        return res;
      },
      json(payload: unknown) {
        headers["Content-Type"] = "application/json; charset=UTF-8";
        response = new Response(JSON.stringify(payload), { status: statusCode, headers });
        return response;
      },
      send(payload: unknown) {
        if (payload !== null && typeof payload === "object") {
          return res.json(payload);
        }
        response = new Response(payload === undefined ? "" : String(payload), { status: statusCode, headers });
        return response;
      },
      redirect(statusOrUrl: number | string, maybeUrl?: string) {
        let code = 302;
        let target = "";
        if (typeof statusOrUrl === "number") {
          code = statusOrUrl;
          target = maybeUrl ?? "";
        } else {
          target = statusOrUrl;
        }
        headers.Location = target;
        response = new Response(null, { status: code, headers });
        return response;
      },
    };

    const result = await handler(req, res);
    if (response) return response;
    if (result instanceof Response) return result;
    if (result !== undefined) {
      headers["Content-Type"] = "application/json; charset=UTF-8";
      return new Response(JSON.stringify(result), { status: statusCode, headers });
    }
    return new Response(null, { status: statusCode, headers });
  };
}