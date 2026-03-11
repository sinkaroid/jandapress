<div align="center">
<a href="http://localhost:3000"><img width="500" src="resources/project/images/tomoe-janda.png" alt="jandapress"></a>

<h4 align="center">RESTful and experimental API for the doujinboards</h4>
<p align="center">
	<a href="https://github.com/sinkaroid/jandapress/actions/workflows/playground.yml"><img src="https://github.com/sinkaroid/jandapress/workflows/Playground/badge.svg"></a>
	<a href="https://qlty.sh/gh/sinkaroid/projects/jandapress"><img src="https://qlty.sh/gh/sinkaroid/projects/jandapress/maintainability.svg" alt="Maintainability" /></a>
</p>

Jandapress was named **JCE** (Janda Cheerio Express) and definitely depends on them.  
The motivation behind this project is to provide developers with accessible and actionable data from various doujinshi sources, with a focus on aggregation and ease of integration for applications and services.

<a href="https://sinkaroid.github.io/jandapress">Playground</a> •
<a href="https://github.com/sinkaroid/jandapress/blob/master/CONTRIBUTING.md">Contributing</a> •
<a href="https://github.com/sinkaroid/jandapress/issues/new/choose">Report Issues</a>
</div>

---

<a href="http://localhost:3000"><img align="right" src="resources/project/images/tomoe.png" width="300"></a>

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
  - [CLosing remarks](https://github.com/sinkaroid/jandapress/blob/master/CLOSING_REMARKS.md)
    - [Alternative links](https://github.com/sinkaroid/jandapress/blob/master/CLOSING_REMARKS.md#alternative-links)
  - [Pronunciation](#Pronunciation)
  - [Client libraries](#client-libraries)
  - [Legal](#legal)


## The problem

Many developers consume doujin websites as a source of data when building web applications. However, most of these sites — such as pururin, simply-hentai, and others — do not provide official APIs or public resources that can be easily integrated into applications.

As a result, developers often need to implement their own scraping logic, build multiple abstractions, and manually maintain integrations for each site.

Jandapress aims to simplify this process by providing a unified interface for accessing data across multiple doujin sites. Instead of maintaining separate implementations, developers can rely on Jandapress to reduce complexity and development overhead.

The current state of the service is **free to use**, meaning anonymous usage is allowed. No authentication is required, and **CORS is enabled** to support browser-based applications.

## The solution
<a href="https://github.com/sinkaroid/jandapress/wiki/Routing"><img src="resources/project/images/jandapressflow_1.png" width="800"></a>

## Running tests
Some tests may fail in CI environments because certain doujin websites restrict or block automated requests originating from CI infrastructure and shared IP ranges.

| Site            | Status                                                                                                                                                                            | Get | Search | Random |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ------ | ------ |
| `nhentai`       | [![Nhentai](https://github.com/sinkaroid/jandapress/workflows/Nhentai%20test/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/nhentai.yml)                   | ✅  | ✅     | ✅     |
| `pururin`       | [![Pururin](https://github.com/sinkaroid/jandapress/workflows/Pururin%20test/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/pururin.yml)                  | ✅  | ✅     | ✅     |
| `hentaifox`     | [![Hentaifox](https://github.com/sinkaroid/jandapress/workflows/Hentaifox%20test/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/hentaifox.yml)             | ✅  | ✅     | ✅     |
| `hentai2read`   | [![Hentai2read](https://github.com/sinkaroid/jandapress/workflows/Hentai2read%20test/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/hentai2read.yml)       | ✅  | ✅     | ❌      |
| `simply-hentai` | [![Simply-hentai](https://github.com/sinkaroid/jandapress/workflows/Simply-hentai%20test/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/simply-hentai.yml) | ✅  | ❌      | ❌      |
| `asmhentai`     | [![Asmhentai](https://github.com/sinkaroid/jandapress/workflows/Asmhentai%20test/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/asmhentai.yml)            | ✅  | ✅     | ✅     |
| `3hentai`     | [![Asmhentai](https://github.com/sinkaroid/jandapress/workflows/3hentai%20test/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/3hentai.yml)            | ✅  | ✅     | ✅     |

## Features

- Aggregates data from multiple doujin sites.
- Provides a consistent and structured response format across all sources.
- Extracted objects are normalized and reassembled to support extensibility.
- Unified interface supporting **get**, **search**, and **random** methods.
- Planned support for optional **JWT authentication** in future releases.
- Primarily based on pure scraping techniques (with limited exceptions where required).


## Prerequisites
<table>
	<td><b>NOTE:</b> NodeJS 20.x or higher / or simply just use docker</td>
</table>

To handle several requests from each web, You will also need [Redis](https://redis.io/) for persistent caching, free tier is available on [Redis Labs](https://redislabs.com/), You can also choose another provider as we using [keyv](https://github.com/jaredwray/keyv) Key-value storage with support for multiple backends. All data must be stored in `<Buffer>` here.

## Installation
Rename `.env.schema` to `.env` and fill the value with your own

```bash
# railway, fly.dev, heroku, vercel or any free service, NHENTAI_IP_ORIGIN should be true
RAILWAY = sinkaroid

# default port
PORT = 3000

# backend storage, default is redis, if not set it will consume memory storage
REDIS_URL = redis://default:somenicepassword@redis-666.c10.us-east-6-6.ec666.cloud.redislabs.com:1337

# ttl expire cache (in X hour)
EXPIRE_CACHE = 1

# nhentai strategy
# default is true which is assign to request on IP instead of nhentai.net with cloudflare
# if you have instance like vps you need chromium or firefox installed and set it to false
NHENTAI_IP_ORIGIN = true

# you must set COOKIE if NHENTAI_IP_ORIGIN is false, read the jandapress docs 
COOKIE = "cf_clearance=l7RsUjiZ3LHAZZKcM7BcCylwD2agwPDU7l9zkg8MzPo-1676044652-0-250"

# you must set USER_AGENT if NHENTAI_IP_ORIGIN is false, read the jandapress docs
USER_AGENT = "jandapress/7.0.1-alpha Node.js/22.22.0"
```

### Docker

    docker pull ghcr.io/sinkaroid/jandapress:latest
    docker run -p 3000:3000 -d ghcr.io/sinkaroid/jandapress:latest

### Docker (your own)
```bash
docker run -d \
  --name=jandapress \
  -p 3000:3000 \
  -e REDIS_URL='redis://default:somenicepassword@redis-666.c10.us-east-6-6.ec666.cloud.redislabs.com:1337' \
  -e EXPIRE_CACHE='1' \
  -e NHENTAI_IP_ORIGIN='false' \
  -e COOKIE='cf_clearance=AbcDefGhijY7RYSKv3YeJUjrI5xQ2Uc-666-0-250' \
  -e USER_AGENT='jandapress/7.0.1-alpha Node.js/22.22.0' \
  ghcr.io/sinkaroid/jandapress:latest
```

### Manual

    git clone https://github.com/sinkaroid/jandapress.git

- Install dependencies
  - `npm install / yarn install`
- Jandapress production
  - `npm run start:prod`
- Jandapress testing and hot reload
  - `npm run start:dev`

## Nhentai Guide
### The problem
https://nhentai.net is protected by Cloudflare. By default, Jandapress uses a [real IP address to bypass the protection](https://github.com/sinkaroid/jandapress/blob/master/src/utils/options.ts#L7..L10). However, in some cases the `/api` endpoint may still return an error even when the request originates from a valid IP address. This typically indicates that the site administrators have restricted requests from certain IP ranges.

![image](resources/project/images/Screenshot_265.png)

### The solution
You will need an instance such as a VPS with a browser installed (Chrome, Chromium, or Firefox). Set `NHENTAI_IP_ORIGIN` to `false`, then configure `COOKIE` and `USER_AGENT`. Requests will be simulated using [tough-cookie](https://github.com/salesforce/tough-cookie) and [http-cookie-agent](https://www.npmjs.com/package/http-cookie-agent).

![image](resources/project/images/Screenshot_267_copy.jpg)

- set `NHENTAI_IP_ORIGIN` to `false` in `.env`
- open a browser and go to https://nhentai.net
- complete the human verification if prompted
- open DevTools and set a custom user agent
- reload the page and wait for the Cloudflare verification again
- open DevTools and navigate to the Network tab
- obtain the `cf_clearance` value and set it as `COOKIE` in `.env`
- set the same user agent as `USER_AGENT` in `.env`
- verify that the cookie works by running `npm run test:cf`
  - it should return a **200 status code**, otherwise review the steps above

[The documentation](https://developers.cloudflare.com/fundamentals/get-started/reference/cloudflare-cookies/#:~:text=This%20cookie%20expires%20after%2030,Bot%20Management%2C%20a%20session%20identifier.) states:

> This cookie expires after 30 minutes of continuous inactivity by the end user. The cookie contains information related to the calculation of Cloudflare’s proprietary bot score and, when Anomaly Detection is enabled on Bot Management, a session identifier.

└── https://developers.cloudflare.com/fundamentals

You must ensure that the cookie remains valid. If the cookie expires, it must be refreshed manually. This process can also be automated using a scheduled task such as a cron job or an interval-based refresh.

## Tests

Run the following commands to execute tests for each supported source:

```bash
# Check whether all supported sites are available for scraping
npm run test:scrape

# Check whether nhentai is currently under Cloudflare protection
npm run test:cf

# Run tests for individual sources
npm run test:nhentai
npm run test:pururin
npm run test:hentaifox
npm run test:asmhentai
npm run test:hentai2read
npm run test:simply-hentai
npm run test:3hentai
```



### Start the production server
`npm run start:prod`

### Running development server
`npm run start:dev`

### Generating playground like swagger from apidoc definition
`npm run build:apidoc`

> To running other tests, you can see object scripts in file `package.json`

## Playground
https://sinkaroid.github.io/jandapress  
> **March 11, 2026**:
We have discontinued providing public APIs and playground services due to ongoing abuse and excessive usage.
To continue using Jandapress, please deploy and run your own self-hosted instance.

- These `parameter?`: means is optional

- `/` : index page

### Nhentai
The missing piece of nhentai.net - https://sinkaroid.github.io/jandapress/#api-nhentai
- `/nhentai` : nhentai api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`, `?page`, `?sort`
  - **related**, takes parameters : `book`
  - **random**
  - <u>sort parameters on search</u>
    - "popular-today", "popular-week", "popular"
  - Example
    - http://localhost:3000/nhentai/get?book=577774
    - http://localhost:3000/nhentai/search?key=futanari
    - http://localhost:3000/nhentai/search?key=futanari&page=2&sort=popular-today
    - http://localhost:3000/nhentai/related?book=577774
    - http://localhost:3000/nhentai/random

### Pururin
The missing piece of pururin.to - https://sinkaroid.github.io/jandapress/#api-pururin
- `/pururin` : pururin api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`, `?page`
  - **random**
  - Example
    - http://localhost:3000/pururin/get?book=63373
    - http://localhost:3000/pururin/search?key=futanari
    - http://localhost:3000/pururin/random

### Hentaifox
The missing piece of hentaifox.com - https://sinkaroid.github.io/jandapress/#api-hentaifox
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
The missing piece of asmhentai.com - https://sinkaroid.github.io/jandapress/#api-asmhentai
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

### Hentai2read
The missing piece of hentai2read.com - https://sinkaroid.github.io/jandapress/#api-hentai2read
- `/hentai2read`: hentai2read api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`
  - <u>sort parameters on search</u>
    - TBA
  - Example
    - http://localhost:3000/hentai2read/get?book=butabako_shotaone_matome_fgo_hen/1
    - http://localhost:3000/hentai2read/search?key=futanari

### Simply-hentai
The missing piece of simply-hentai.com - https://sinkaroid.github.io/jandapress/#api-simply-hentai
- `/simply-hentai`: simply-hentai api
  - **get**, takes parameters : `book`
  - <u>sort parameters on search</u>
    - TBA
  - Example
    - http://localhost:3000/simply-hentai/get?book=fate-grand-order/fgo-sanbunkatsuhou/all-pages

### 3hentai
The missing piece of 3hentai.net - https://sinkaroid.github.io/jandapress/#api-3hentai
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


## Status response
`"success": true,` or `"success": false,`

    HTTP/1.1 200 OK
    HTTP/1.1 400 Bad Request
    HTTP/1.1 500 Fail to get data

## Frequently asked questions 
**Q: The website response is slow**  
> That's unfortunate, this repository was opensource already, You can host and deploy Jandapress with your own instance. Any fixes and improvements will updating to this repo.  

> **March 11, 2026**:
We have discontinued providing public APIs and playground services due to ongoing abuse and excessive usage.
To continue using Jandapress, please deploy and run your own self-hosted instance.

## Pronunciation
[`id_ID`](https://www.localeplanet.com/java/id-ID/index.html) • **/jan·da/** — Dewasa dan mengikat; _(?)_ **/press/** shorthand for expressjs; _(?)_

## Client libraries
Seamlessly integrate with the languages you love, simplified the usage, and intelisense definitions on your IDEs

- [janda](https://github.com/sinkaroid/janda) Python wrapper by [sinkaroid](https://github.com/sinkaroid)
- Or [create your own](https://github.com/sinkaroid/jandapress/edit/master/README.md)

## Legal
This tool can be freely copied, modified, altered, distributed without any attribution whatsoever. However, if you feel
like this tool deserves an attribution, mention it. It won't hurt anybody.
> Licence: WTF.
