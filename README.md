<div align="center">
<a href="https://janda.sinkaroid.org"><img width="500" src="https://cdn.discordapp.com/attachments/1046495201176334467/1055678255866318898/tomoe-janda.png" alt="jandapress"></a>

<h4 align="center">RESTful and experimental API for the doujinboards</h4>
<p align="center">
	<a href="https://github.com/sinkaroid/jandapress/actions/workflows/playground.yml"><img src="https://github.com/sinkaroid/jandapress/workflows/Playground/badge.svg"></a>
	<a href="https://codeclimate.com/github/sinkaroid/jandapress/maintainability"><img src="https://api.codeclimate.com/v1/badges/829b8fe63ab78a425f0b/maintainability" /></a>
</p>

Jandapress was named **JCE** (Janda Cheerio Express) and definitely depends on them.  
The motivation of this project is to bring you an actionable data related doujin with gather in mind.

<a href="https://sinkaroid.github.io/jandapress">Playground</a> •
<a href="https://github.com/sinkaroid/jandapress/blob/master/CONTRIBUTING.md">Contributing</a> •
<a href="https://github.com/sinkaroid/jandapress/issues/new/choose">Report Issues</a>
</div>

---

<a href="https://janda.sinkaroid.org"><img align="right" src="https://cdn.discordapp.com/attachments/952117487166705747/986315079802814524/tomoe.png" width="300"></a>

- [Jandapress](#)
  - [The problem](#the-problem)
  - [The solution](#the-solution)
  - [Features](#features)
    - [Jandapress vs. the doujinboards](#jandapress-vs-the-whole-doujin-sites)
  - [Prerequisites](#prerequisites)
    - [Installation](#installation)
      - [Docker](#docker)
      - [Manual](#manual)
    - [Running tests](#running-tests)
    - [Nhentai Guide](#nhentai-guide)
  - [Playground](https://sinkaroid.github.io/jandapress)
    - [Routing](#playground)
    - [Status response](#status-response)
  - [CLosing remarks](https://github.com/sinkaroid/jandapress/blob/master/CLOSING_REMARKS.md)
    - [Alternative links](https://github.com/sinkaroid/jandapress/blob/master/CLOSING_REMARKS.md#alternative-links)
  - [Pronunciation](#Pronunciation)
  - [Client libraries / Wrappers](#client-libraries--wrappers)
  - [Legal](#legal)


## The problem
You enjoy consume doujin sites to build web applications. There are a lot sites that have effort especially pururin, simply-hentai and etc, not official api available nor public resource that can be used for everyone. Instead making lot of abstraction and enumerating them manually, You can rely on jandapress to make less of pain. The current state is FREE to use, meant all anonymous usage is allowed no aunthentication required and CORS was enabled.

## The solution
<a href="https://github.com/sinkaroid/jandapress/wiki/Routing"><img src="https://cdn.discordapp.com/attachments/1082449595033997434/1107863120275320852/jandapressflow_1.png" width="800"></a>

## Features

- Gather the most doujin sites
- Objects taken that are consistent structure, almost
- Objects taken is re-appended to make extendable
- All in one: get, search, and random methods
- In the future we may implement JWT authentication
- Pure scraping, except nh sigh..

## Jandapress vs. the whole doujin sites
**Features availability** that Jandapress has
| Site            | Status                                                                                                                                                                            | Get | Search | Random |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ------ | ------ |
| `nhentai`       | [![Nhentai](https://github.com/sinkaroid/jandapress/workflows/Nhentai%20test/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/nhentai.yml)                   | ✅  | ✅     | ✅     |
| `pururin`       | [![Pururin](https://github.com/sinkaroid/jandapress/workflows/Pururin%20test/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/pururin.yml)                  | ✅  | ✅     | ✅     |
| `hentaifox`     | [![Hentaifox](https://github.com/sinkaroid/jandapress/workflows/Hentaifox%20test/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/hentaifox.yml)             | ✅  | ✅     | ✅     |
| `hentai2read`   | [![Hentai2read](https://github.com/sinkaroid/jandapress/workflows/Hentai2read%20test/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/hentai2read.yml)       | ✅  | ✅     | ❌      |
| `simply-hentai` | [![Simply-hentai](https://github.com/sinkaroid/jandapress/workflows/Simply-hentai%20test/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/simply-hentai.yml) | ✅  | ❌      | ❌      |
| `asmhentai`     | [![Asmhentai](https://github.com/sinkaroid/jandapress/workflows/Asmhentai%20test/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/asmhentai.yml)            | ✅  | ✅     | ✅     |
| `3hentai`     | [![Asmhentai](https://github.com/sinkaroid/jandapress/workflows/3hentai%20test/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/3hentai.yml)            | ✅  | ✅     | ✅     |
| `nhentai.to`     | [![Nhentaito](https://github.com/sinkaroid/jandapress/workflows/Nhentaito%20test/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/nhentaito.yml)            | ✅  | ✅     | ✅     |

## Prerequisites
<table>
	<td><b>NOTE:</b> NodeJS 16.x or higher</td>
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
USER_AGENT = "jandapress/1.0.5 Node.js/16.9.1"
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
  -e USER_AGENT='jandapress/1.0.5 Node.js/16.9.1' \
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
https://nhentai.net was Clouflare protection enabled, for default jandapress use [real IP address to bypass the protection](https://github.com/sinkaroid/jandapress/blob/master/src/utils/options.ts#L7..L10), but **sometimes** even it's from IP address the `/api` path return error that means admins or their maintainer don't allow us to request from the IP address.
![image](https://cdn.discordapp.com/attachments/952117487166705747/1073694957111627906/Screenshot_265.png)

### The solution
You will need instance such as VPS and install Chrome or Chromium or Firefox, You have to set `NHENTAI_IP_ORIGIN` to `false`, set `COOKIE` and `USER_AGENT`. We'll simulate the request with [tough-cookie](https://github.com/salesforce/tough-cookie) and [http-cookie-agent](https://www.npmjs.com/package/http-cookie-agent) 

![image](https://cdn.discordapp.com/attachments/952117487166705747/1073699069643468902/Screenshot_267_copy.jpg)

- set `NHENTAI_IP_ORIGIN` to `false` in `.env` file
- open browser and go to https://nhentai.net
- verify you are human
- open devtools and set custom user agent
- reload the page and wait cloudflare again
- open devtools and go to network tab and request
- get the `cf_clearance` value and set it to `COOKIE` in `.env` file 
- set the user agent to `USER_AGENT` in `.env` file
- test that your cookie is working `npm run test:cf`
  - it should return 200 status code otherwise watch your step

[The documentation](https://developers.cloudflare.com/fundamentals/get-started/reference/cloudflare-cookies/#:~:text=This%20cookie%20expires%20after%2030,Bot%20Management%2C%20a%20session%20identifier.) said and correct me if I'm wrong:
> This cookie expires after 30 minutes of continuous inactivity by the end user. The cookie contains information related to the calculation of Cloudflare’s proprietary bot score and, when Anomaly Detection is enabled on Bot Management, a session identifier. 

└── https://developers.cloudflare.com/fundamentals

You will need to make your cookie is not expired otherwise manual update is required, it can be with set interval or cron job to automate your request.

## Running tests
Jandapress testing

### Start the production server
`npm run start:prod`

### Running development server
`npm run start:dev`

### Check the whole sites, It's available for scraping or not
`npm run test`

### Check nhentai It's under cloudflare protection or not
`npm run test:cf`

### Generating playground like swagger from apidoc definition
`npm run build:apidoc`

> To running other tests, you can see object scripts in file `package.json`

## Playground
https://sinkaroid.github.io/jandapress

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
    - https://janda.sinkaroid.org/nhentai/get?book=177013
    - https://janda.sinkaroid.org/nhentai/search?key=futanari
    - https://janda.sinkaroid.org/nhentai/search?key=futanari&page=2&sort=popular-today
    - https://janda.sinkaroid.org/nhentai/related?book=177013
    - https://janda.sinkaroid.org/nhentai/random

### Pururin
The missing piece of pururin.to - https://sinkaroid.github.io/jandapress/#api-pururin
- `/pururin` : pururin api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`, `?page`, `?sort`
  - **random**
  - <u>sort parameters on search</u>
    - "newest", "most-popular", "highest-rated", "most-viewed", "title", "random" 
  - Example
    - https://janda.sinkaroid.org/pururin/get?book=63373
    - https://janda.sinkaroid.org/pururin/search?key=futanari
    - https://janda.sinkaroid.org/pururin/search?key=futanari&page=2&sort=most-viewed
    - https://janda.sinkaroid.org/pururin/random

### Hentaifox
The missing piece of hentaifox.com - https://sinkaroid.github.io/jandapress/#api-hentaifox
- `/hentaifox`: hentaifox api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`, `?page`, `?sort`
  - **random**
  - <u>sort parameters on search</u>
    - "latest", "popular"
  - Example
    - https://janda.sinkaroid.org/hentaifox/get?book=97527
    - https://janda.sinkaroid.org/hentaifox/search?key=milf
    - https://janda.sinkaroid.org/hentaifox/search?key=milf&page=2&sort=latest
    - https://janda.sinkaroid.org/hentaifox/randon

### Asmhentai
The missing piece of asmhentai.com - https://sinkaroid.github.io/jandapress/#api-asmhentai
- `/asmhentai`: asmhentai api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`, `?page`
  - **random**
  - <u>sort parameters on search</u>
    - None
  - Example
    - https://janda.sinkaroid.org/asmhentai/get?book=416773
    - https://janda.sinkaroid.org/asmhentai/search?key=futanari
    - https://janda.sinkaroid.org/asmhentai/search?key=futanari&page=2
    - https://janda.sinkaroid.org/asmhentai/random

### Hentai2read
The missing piece of hentai2read.com - https://sinkaroid.github.io/jandapress/#api-hentai2read
- `/hentai2read`: hentai2read api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`
  - <u>sort parameters on search</u>
    - TBA
  - Example
    - https://janda.sinkaroid.org/hentai2read/get?book=butabako_shotaone_matome_fgo_hen/1
    - https://janda.sinkaroid.org/hentai2read/search?key=futanari

### Simply-hentai
The missing piece of simply-hentai.com - https://sinkaroid.github.io/jandapress/#api-simply-hentai
- `/simply-hentai`: simply-hentai api
  - **get**, takes parameters : `book`
  - <u>sort parameters on search</u>
    - TBA
  - Example
    - https://janda.sinkaroid.org/simply-hentai/get?book=fate-grand-order/fgo-sanbunkatsuhou/all-pages

### 3hentai
The missing piece of 3hentai.net - https://sinkaroid.github.io/jandapress/#api-3hentai
- `/3hentai`: 3hentai api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`, `?page`, `?sort`
  - **random**
  - <u>sort parameters on search</u>
    - "recent", "popular-24h", "popular-7d", "popular"
  - Example
    - https://janda.sinkaroid.org/3hentai/get?book=608979
    - https://janda.sinkaroid.org/3hentai/search?key=futanari
    - https://janda.sinkaroid.org/3hentai/search?key=futanari&page=2&sort=popular-7d
    - https://janda.sinkaroid.org/3hentai/random

### Nhentai.to
The missing piece of nhentai.to - https://sinkaroid.github.io/jandapress/#api-nhentaito
- `/nhentaito`: nhentaito api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`, `?page`
  - **related**, takes parameters : `book`
  - **random**
  - <u>sort parameters on search</u>
    - None
  - Example
    - https://janda.sinkaroid.org/nhentaito/get?book=272
    - https://janda.sinkaroid.org/nhentaito/search?key=futanari
    - https://janda.sinkaroid.org/nhentaito/search?key=futanari&page=2
    - https://janda.sinkaroid.org/nhentaito/related?book=272
    - https://janda.sinkaroid.org/nhentaito/random


## Status response
`"success": true,` or `"success": false,`

    HTTP/1.1 200 OK
    HTTP/1.1 400 Bad Request
    HTTP/1.1 500 Fail to get data

## Frequently asked questions 
**Q: The website response is slow**  
> That's unfortunate, This repository was opensource already, You can host and deploy Jandapress with your own instance. Any fixes and improvements will updating to this repo.

**Q: I dont want to host my own instance**   
> That's unfortunate, Hit the "Sponsor this project" button, any kind of donations will helps me to funding the development.

## Pronunciation
[`id_ID`](https://www.localeplanet.com/java/id-ID/index.html) • **/jan·da/** — Dewasa dan mengikat; _(?)_


## Client libraries / Wrappers
Seamlessly integrate with the languages you love, simplified the usage, and intelisense definitions on your IDEs

- [janda](https://github.com/sinkaroid/janda) Python wrapper by [sinkaroid](https://github.com/sinkaroid)
- Or [create your own](https://github.com/sinkaroid/jandapress/edit/master/README.md)

## Legal
This tool can be freely copied, modified, altered, distributed without any attribution whatsoever. However, if you feel
like this tool deserves an attribution, mention it. It won't hurt anybody.
> Licence: WTF.
