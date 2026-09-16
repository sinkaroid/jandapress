<div align="center">
<a href="https://sinkaroid.github.io/jandapress"><img width="500" src="resources/project/images/tomoe-janda.webp" alt="jandapress"></a>

<h4 align="center">Unified REST + GraphQL API for nhentai and other doujinshi</h4>
<p align="center">
	<a href="https://github.com/sinkaroid/jandapress/actions/workflows/playground.yml"><img src="https://github.com/sinkaroid/jandapress/workflows/Playground/badge.svg"></a>
	<a href="https://qlty.sh/gh/sinkaroid/projects/jandapress"><img src="https://qlty.sh/gh/sinkaroid/projects/jandapress/maintainability.svg" alt="Maintainability" /></a>
</p>

Jandapress was originally named **JCE** (Janda Cheerio ExpressJS (`legacy-name`)).  
The motivation behind this project is to provide, accessible and actionable data from various doujinshi sources, with a focus on aggregation and ease of integration for applications and services.

<a href="https://sinkaroid.github.io/jandapress">Playground</a> •
<a href="https://github.com/sinkaroid/jandapress/blob/master/CONTRIBUTING.md">Contributing</a> •
<a href="https://github.com/sinkaroid/jandapress/issues/new/choose">Report Issues</a>

</div>

---

<a href="https://sinkaroid.github.io/jandapress"><img align="right" src="resources/project/images/tomoe.webp" width="300"></a>

- [Jandapress](#)
  - [The problem](#the-problem)
  - [The solution](#the-solution)
  - [Running tests](#running-tests)
    - [Tests](#tests)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
    - [Installation](#installation)
      - [Docker](#docker)
      - [Manual](#manual)
    - [Tests](#tests)
    - [Nhentai Guide](#nhentai-guide)
  - [Playground](https://sinkaroid.github.io/jandapress)
    - [Routing](#playground)
    - [Status response](#status-response)
  - [Pronunciation](#Pronunciation)
  - [Timeline](#timeline)
    - [The Third Ascension](#third-ascension--rust-axum)
  - [Legal](#legal)
  - [Microservices](#microservices)

## The problem

Many people consume doujin websites as a source of data when building web applications. However, most of these sites — such as pururin, simply-hentai, and others — do not provide official APIs or public resources that can be easily integrated into applications.

As a result, they often need to implement their own scraping logic, build multiple abstractions, and manually maintain integrations for each site.

## The solution

<a href="https://github.com/sinkaroid/jandapress/wiki/Routing"><img src="resources/project/images/jandapressflow_1.png" width="800"></a>

Jandapress acts as a unified data gateway and abstraction layer across fragmented doujin platforms. By normalizing disparate upstream sources into a single, cohesive REST and GraphQL interface, developers can bypass custom scraping pipelines and brittle integration maintenance entirely.

The service is designed for zero-friction adoption: anonymous access is permitted, no authentication is required, and CORS is enabled out of the box for seamless client-side and browser integration.

## Running tests

Some tests may fail in CI environments because certain doujin websites restrict or block automated requests originating from CI infrastructure and shared IP ranges.

| Site            | Status                                                                                                                                                                              | Get | Search | Random |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ------ | ------ |
| `nhentai`       | [![Test Scraper](https://github.com/sinkaroid/jandapress/actions/workflows/test-scraper.yml/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/test-scraper.yml) | ✅  | ✅     | ✅     |
| `pururin`       | [![Test Scraper](https://github.com/sinkaroid/jandapress/actions/workflows/test-scraper.yml/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/test-scraper.yml) | ✅  | ✅     | ✅     |
| `hentaifox`     | [![Test Scraper](https://github.com/sinkaroid/jandapress/actions/workflows/test-scraper.yml/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/test-scraper.yml) | ✅  | ✅     | ✅     |
| `hentai2read`   | [![Test Scraper](https://github.com/sinkaroid/jandapress/actions/workflows/test-scraper.yml/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/test-scraper.yml) | ✅  | ✅     | ❌     |
| `simply-hentai` | [![Test Scraper](https://github.com/sinkaroid/jandapress/actions/workflows/test-scraper.yml/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/test-scraper.yml) | ✅  | ❌     | ❌     |
| `asmhentai`     | [![Test Scraper](https://github.com/sinkaroid/jandapress/actions/workflows/test-scraper.yml/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/test-scraper.yml) | ✅  | ✅     | ✅     |
| `3hentai`       | [![Test Scraper](https://github.com/sinkaroid/jandapress/actions/workflows/test-scraper.yml/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/test-scraper.yml) | ✅  | ✅     | ✅     |

## Features

- Decentralized and aggregated data.
- Consistent and structured responses.
- Objects are normalized and reassembled to support extensibility.
- Unified interface supporting **get**, **search**, and **random** methods.
- Pure scraping, only nhentai which uses official API endpoint.

## Prerequisites

<table>
  <td><b>NOTE:</b> Rust 1.96.0 or higher / or simply just use docker</td>
</table>

To handle several requests, You also need [Redis](https://redis.io/) for persistent caching, free tier is available on [Redis Labs](https://redislabs.com/).

## Installation

Rename `.env.schema` to `.env` and fill the value with your own

```bash
# Enable or disable the GraphQL endpoint (/graphql). Set to true to enable.
JANDAPRESS_GRAPHQL = true

# default port
PORT = 3000

# backend storage, default is redis, if not set it will consume memory storage
REDIS_URL = redis://default:somenicepassword@redis-666.c10.us-east-6-6.ec666.cloud.redislabs.com:1337

# ttl expire cache (in X hour)
EXPIRE_CACHE = 1

# optional: API key for nhentai official API
NHENTAI_API_KEY = "some_nice_key"

# optional custom user agent for upstream requests
USER_AGENT = "jandapress/10.6.3 Rust/1.96.0"
```

### Docker

    docker pull ghcr.io/sinkaroid/jandapress:latest
    docker run -p 3000:3000 -d ghcr.io/sinkaroid/jandapress:latest

### Docker or Podman

```bash
docker run -d \
  --name=jandapress \
  --restart unless-stopped \
  -p 8066:3000 \
  -e REDIS_URL='redis://default:somenicepassword@redis-666.c10.us-east-6-6.ec666.cloud.redislabs.com:1337' \
  -e EXPIRE_CACHE='1' \
  -e NHENTAI_API_KEY='some_nice_key' \
  ghcr.io/sinkaroid/jandapress:latest
```

### Manual

```sh
## clone
git clone https://github.com/sinkaroid/jandapress.git

## dev
cargo start-dev

## prod
cargo start-prod
```

## Nhentai Guide

### The solution

The CloudFlare issue has been resolved by using nhentai official API endpoints (`/api/v2`) for search, related, and random ID discovery.

- set `NHENTAI_API_KEY` in `.env` (optional but recommended)
- set `USER_AGENT` in `.env` if you need a custom upstream identifier

## Tests

[`.cargo/config.toml`](.cargo/config.toml)

## Playground

https://sinkaroid.github.io/jandapress

> **March 11, 2026**:
> We have discontinued providing public APIs and playground services due to ongoing abuse and excessive usage.
> To continue using Jandapress, please deploy and run your own self-hosted instance.

## GraphQL

The GraphQL endpoint is experimental and gated behind the `JANDAPRESS_GRAPHQL=true` environment variable.

1. **Start the server with GraphQL enabled**:

   ```bash
   # On Unix-like systems
   JANDAPRESS_GRAPHQL=true cargo start-dev

   # On Windows (PowerShell)
   $env:JANDAPRESS_GRAPHQL="true"; cargo start-dev
   ```

2. **Accessing endpoint**: Send `GET` or `POST` requests to `http://localhost:3000/graphql`.
3. **GraphiQL Playground**: Open `http://localhost:3000/graphql` in your browser when running in development mode to use the interactive playground.

### Curl Examples

**POST Request**:

```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"{ nhentai { get(book: 577774) { success source data { title id tags } } } }\"}"
```

**GET Request**:

```bash
curl -G "http://localhost:3000/graphql" \
  --data-urlencode "query={ nhentai { get(book: 577774) { success source data { title id tags } } } }"
```

### Example Queries

**Query NHentai Book**:

```graphql
query {
  nhentai {
    get(book: 577774) {
      success
      source
      data {
        title
        id
        tags
      }
    }
  }
}
```

**Query simply-hentai Book**:

```graphql
query {
  simplyHentai {
    get(book: "fate-grand-order/fgo-sanbunkatsuhou/all-pages") {
      success
      source
      data {
        title
        id
        tags
        total
      }
    }
  }
}
```

## REST

- These `parameter?`: means is optional

- `/` : index page

### Nhentai

The missing piece of nhentai - https://sinkaroid.github.io/jandapress/#GET/nhentai

- `/nhentai` : nhentai api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`, `?page`, `?sort`
  - **related**, takes parameters : `book`
  - **random**
  - <u>sort parameters on search</u>
    - "date", "popular", "popular-today", "popular-week", "popular-month"
  - Example
    - http://localhost:3000/nhentai/get?book=577774
    - http://localhost:3000/nhentai/search?key=futanari
    - http://localhost:3000/nhentai/search?key=futanari&page=2&sort=popular-today
    - http://localhost:3000/nhentai/related?book=577774
    - http://localhost:3000/nhentai/random

### Pururin

The missing piece of pururin - https://sinkaroid.github.io/jandapress/#GET/pururin

- `/pururin` : pururin api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`, `?page`
  - **random**
  - Example
    - http://localhost:3000/pururin/get?book=63373
    - http://localhost:3000/pururin/search?key=futanari
    - http://localhost:3000/pururin/random

### Hentaifox

The missing piece of hentaifox - https://sinkaroid.github.io/jandapress/#GET/hentaifox

- `/hentaifox`: hentaifox api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`, `?page`, `?sort`
  - **random**
  - <u>sort parameters on search</u>
    - "latest", "popular"
  - Example
    - http://localhost:3000/hentaifox/get?book=97527
    - http://localhost:3000/hentaifox/search?key=milf
    - http://localhost:3000/hentaifox/search?key=milf&page=2&sort=latest
    - http://localhost:3000/hentaifox/random

### Asmhentai

The missing piece of asmhentai - https://sinkaroid.github.io/jandapress/#GET/asmhentai

- `/asmhentai`: asmhentai api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`, `?page`
  - **random**
  - <u>sort parameters on search</u>
    - None
  - Example
    - http://localhost:3000/asmhentai/get?book=416773
    - http://localhost:3000/asmhentai/search?key=futanari
    - http://localhost:3000/asmhentai/search?key=futanari&page=2
    - http://localhost:3000/asmhentai/random

### 3hentai

The missing piece of 3hentai - https://sinkaroid.github.io/jandapress/#GET/3hentai

- `/3hentai`: 3hentai api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`, `?page`, `?sort`
  - **random**
  - <u>sort parameters on search</u>
    - "recent", "popular-24h", "popular-7d", "popular"
  - Example
    - http://localhost:3000/3hentai/get?book=608979
    - http://localhost:3000/3hentai/search?key=futanari
    - http://localhost:3000/3hentai/search?key=futanari&page=2&sort=popular-7d
    - http://localhost:3000/3hentai/random

### Hentai2read

The missing piece of hentai2read - https://sinkaroid.github.io/jandapress/#GET/hentai2read

- `/hentai2read`: hentai2read api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`
  - <u>sort parameters on search</u>
    - TBA
  - Example
    - http://localhost:3000/hentai2read/get?book=butabako_shotaone_matome_fgo_hen/1
    - http://localhost:3000/hentai2read/search?key=futanari

### Simply-hentai

The missing piece of simply-hentai - https://sinkaroid.github.io/jandapress/#GET/simply-hentai

- `/simply-hentai`: simply-hentai api
  - **get**, takes parameters : `book`
  - <u>sort parameters on search</u>
    - TBA
  - Example
    - http://localhost:3000/simply-hentai/get?book=fate-grand-order/fgo-sanbunkatsuhou/all-pages

## Status response

`"success": true,` or `"success": false,`

    HTTP/1.1 200 OK
    HTTP/1.1 400 Bad Request
    HTTP/1.1 500 Fail to get data

## Frequently asked questions

**Q: The website response is slow**

> That's unfortunate, this repository was opensource already, You can host and deploy Jandapress with your own instance. Any fixes and improvements will updating to this repo.

> **March 11, 2026**:
> We have discontinued providing public APIs and playground services due to ongoing abuse and excessive usage.
> To continue using Jandapress, please deploy and run your own self-hosted instance.

## Pronunciation

[`id_ID`](https://www.localeplanet.com/java/id-ID/index.html) • **/jan·da/** — Dewasa dan mengikat; _(?)_ **/press/** shorthand for expressjs (legacy name); _(?)_

## Timeline

The project has gone through three major architectural phases, with each iteration driven by the same goal:

- **Serving large production workload while continuously reducing runtime overhead and memory consumption.** The jandapress powers [scathachbot.xyz](https://scathachbot.xyz/) which serves more than 60K servers. It is intentionally deployed on low-memory VMs with less than 4 GB of RAM, where every megabyte matters because the machine also hosts multiple other services.

### First Ascension — NodeJS, Express + cheerio

The initial version was built with **Express.js**. The `janda(press)` branding came from this version. But it's bloated.

### Second Ascension — Bun, Hono + cheerio

The second iteration migrated to **Hono running on Bun** significantly reducing the overhead compared to the first implementation.

- This was significant improvements. However, after running continuously for several weeks, its memory usage could reach approximately >350 MB. While reasonable in isolation, that footprint becomes significant when multiple services share the same constrained VM.

### Third Ascension — Rust, Axum + scraper

Focus on minimal runtime overhead, predictable resource consumption, and long-term performance. I will keep looking forward on it.

- The goal of the third phase is not merely higher performance, but dramatically lower and more predictable resource consumption, allowing the service to coexist efficiently with other workloads on small VMs.

## Legal

This tool can be freely copied, modified, altered, distributed without any attribution whatsoever. However, if you feel
like this tool deserves an attribution, mention it. It won't hurt anybody.

> Licence: WTF.

## Microservices

Microservices and subprojects is part of a broader ecosystem of specialized services, each focused on a specific platform or content source while sharing a common design philosophy maintained by [ScathachGrip](https://github.com/ScathachGrip)

- **sinkaroid/jandapress — Unified REST and GraphQL API for nhentai and other doujinshi.**
- [sinkaroid/lustpress](https://github.com/sinkaroid/lustpress) — Unified REST and GraphQL API for PornHub and other R18 platforms
- [sinkaroid/matoi](https://github.com/sinkaroid/matoi) — Unified REST + GraphQL gateway for booru imageboards
- [sinkaroid/pixivHono](https://github.com/sinkaroid/pixivHono) — Unified REST and GraphQL API for Pixiv

Each service is developed independently, enabling modular deployments, isolated maintenance, and platform-specific optimizations while remaining interoperable within the ecosystem.
