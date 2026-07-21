import type { Context } from "hono";
import { graphql } from "graphql";
import { schema } from "./schema";

export async function graphqlHandler(c: Context) {
  if (c.req.method === "GET") {
    const query = c.req.query("query");
    if (!query) {
      return c.json({ error: "Must provide query string" }, 400);
    }
    const variables = c.req.query("variables");
    const result = await graphql({
      schema,
      source: query,
      variableValues: variables ? JSON.parse(variables) : undefined,
    });
    return c.json(result);
  }

  if (c.req.method === "POST") {
    const contentType = c.req.header("content-type") || "";
    if (contentType.includes("application/graphql")) {
      const source = await c.req.text();
      const result = await graphql({ schema, source });
      return c.json(result);
    }

    const body = await c.req.json<{
      query?: string;
      variables?: Record<string, unknown>;
      operationName?: string;
    }>();
    if (!body.query) {
      return c.json({ error: "Must provide query string" }, 400);
    }
    const result = await graphql({
      schema,
      source: body.query,
      variableValues: body.variables,
      operationName: body.operationName,
    });
    return c.json(result);
  }

  return c.json({ error: "Method not allowed" }, 405);
}
