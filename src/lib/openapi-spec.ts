export const openAPISpec = {
  openapi: "3.0.0",
  info: {
    title: "JandaPress API",
    version: "10.0.2-alpha",
    description: "RESTful API for nhentai, pururin, hentaifox, asmhentai, hentai2read, simply-hentai, and 3hentai.",
    contact: {
      name: "sinkaroid",
      url: "https://github.com/sinkaroid/jandapress",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
  paths: {
    "/": {
      get: {
        summary: "Service health",
        operationId: "health",
        responses: {
          "200": {
            description: "Service status",
          },
        },
      },
    },
    "/nhentai/get": {
      get: {
        summary: "Get nhentai gallery",
        operationId: "nhentaiGet",
        parameters: [
          { name: "book", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Success" } },
      },
    },
    "/nhentai/search": {
      get: {
        summary: "Search nhentai galleries",
        operationId: "nhentaiSearch",
        parameters: [
          { name: "key", in: "query", required: true, schema: { type: "string" } },
          { name: "page", in: "query", required: false, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Success" } },
      },
    },
    "/nhentai/related": {
      get: {
        summary: "Get nhentai related galleries",
        operationId: "nhentaiRelated",
        parameters: [
          { name: "book", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Success" } },
      },
    },
    "/nhentai/random": {
      get: {
        summary: "Get random nhentai gallery",
        operationId: "nhentaiRandom",
        responses: { "200": { description: "Success" } },
      },
    },
    "/pururin/get": {
      get: {
        summary: "Get pururin gallery",
        operationId: "pururinGet",
        parameters: [
          { name: "book", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Success" } },
      },
    },
    "/pururin/search": {
      get: {
        summary: "Search pururin galleries",
        operationId: "pururinSearch",
        parameters: [
          { name: "key", in: "query", required: true, schema: { type: "string" } },
          { name: "page", in: "query", required: false, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Success" } },
      },
    },
    "/pururin/random": {
      get: {
        summary: "Get random pururin gallery",
        operationId: "pururinRandom",
        responses: { "200": { description: "Success" } },
      },
    },
    "/hentaifox/get": {
      get: {
        summary: "Get hentaifox gallery",
        operationId: "hentaifoxGet",
        parameters: [
          { name: "book", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Success" } },
      },
    },
    "/hentaifox/search": {
      get: {
        summary: "Search hentaifox galleries",
        operationId: "hentaifoxSearch",
        parameters: [
          { name: "key", in: "query", required: true, schema: { type: "string" } },
          { name: "page", in: "query", required: false, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Success" } },
      },
    },
    "/hentaifox/random": {
      get: {
        summary: "Get random hentaifox gallery",
        operationId: "hentaifoxRandom",
        responses: { "200": { description: "Success" } },
      },
    },
    "/asmhentai/get": {
      get: {
        summary: "Get asmhentai gallery",
        operationId: "asmhentaiGet",
        parameters: [
          { name: "book", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Success" } },
      },
    },
    "/asmhentai/search": {
      get: {
        summary: "Search asmhentai galleries",
        operationId: "asmhentaiSearch",
        parameters: [
          { name: "key", in: "query", required: true, schema: { type: "string" } },
          { name: "page", in: "query", required: false, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Success" } },
      },
    },
    "/asmhentai/random": {
      get: {
        summary: "Get random asmhentai gallery",
        operationId: "asmhentaiRandom",
        responses: { "200": { description: "Success" } },
      },
    },
    "/hentai2read/get": {
      get: {
        summary: "Get hentai2read gallery",
        operationId: "hentai2readGet",
        parameters: [
          { name: "book", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Success" } },
      },
    },
    "/hentai2read/search": {
      get: {
        summary: "Search hentai2read galleries",
        operationId: "hentai2readSearch",
        parameters: [
          { name: "key", in: "query", required: true, schema: { type: "string" } },
          { name: "page", in: "query", required: false, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Success" } },
      },
    },
    "/simply-hentai/get": {
      get: {
        summary: "Get simply-hentai gallery",
        operationId: "simplyHentaiGet",
        parameters: [
          { name: "book", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Success" } },
      },
    },
    "/3hentai/get": {
      get: {
        summary: "Get 3hentai gallery",
        operationId: "threeHentaiGet",
        parameters: [
          { name: "book", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Success" } },
      },
    },
    "/3hentai/search": {
      get: {
        summary: "Search 3hentai galleries",
        operationId: "threeHentaiSearch",
        parameters: [
          { name: "key", in: "query", required: true, schema: { type: "string" } },
          { name: "page", in: "query", required: false, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Success" } },
      },
    },
    "/3hentai/random": {
      get: {
        summary: "Get random 3hentai gallery",
        operationId: "threeHentaiRandom",
        responses: { "200": { description: "Success" } },
      },
    },
    "/g/{id}": {
      get: {
        summary: "Redirect to nhentai gallery",
        operationId: "redirectNhentai",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "301": { description: "Redirect" } },
      },
    },
    "/p/{id}": {
      get: {
        summary: "Redirect to pururin gallery",
        operationId: "redirectPururin",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "301": { description: "Redirect" } },
      },
    },
    "/h/{id}": {
      get: {
        summary: "Redirect to hentaifox gallery",
        operationId: "redirectHentaifox",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "301": { description: "Redirect" } },
      },
    },
    "/a/{id}": {
      get: {
        summary: "Redirect to asmhentai gallery",
        operationId: "redirectAsmhentai",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "301": { description: "Redirect" } },
      },
    },
    "/doc": {
      get: {
        summary: "OpenAPI specification",
        operationId: "openapiDocument",
        responses: { "200": { description: "OpenAPI JSON" } },
      },
    },
    "/playground": {
      get: {
        summary: "Swagger UI playground",
        operationId: "swaggerPlayground",
        responses: { "200": { description: "Swagger UI page" } },
      },
    },
  },
} as const;
