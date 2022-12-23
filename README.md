<div align="center">
<a href="https://janda.mod.land"><img width="500" src="https://cdn.discordapp.com/attachments/1046495201176334467/1055678255866318898/tomoe-janda.png" alt="musashi"></a>

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

<a href="https://janda.mod.land"><img align="right" src="https://cdn.discordapp.com/attachments/937006009212350496/1055928998888222861/musashi-ts-color.png" width="400"></a>

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
  - [Playground](https://sinkaroid.github.io/jandapress)
    - [Routing](#playground)
    - [Status response](#status-response)
  - [Limitations](#limitations)
  - [CLosing remarks](https://github.com/sinkaroid/jandapress/blob/master/CLOSING_REMARKS.md)
    - [Alternative links](https://github.com/sinkaroid/jandapress/blob/master/CLOSING_REMARKS.md#alternative-links)
  - [Pronunciation](#Pronunciation)
  - [Client libraries / Wrappers](#client-libraries--wrappers)
  - [Legal](#legal)


## The problem
You enjoy consume doujin sites to build web applications. There are a lot sites that have effort especially pururin, simply-hentai and etc, not official api available nor public resource that can be used for everyone. Instead making lot of abstraction and enumerating them manually, You can rely on jandapress to make less of pain. The current state is FREE to use, meant all anonymous usage is allowed no aunthentication required and CORS was enabled.

## The solution
<a href="https://github.com/sinkaroid/jandapress/wiki/Routing"><img src="https://cdn.discordapp.com/attachments/952117487166705747/1025602331456307230/jandaflow2.png" width="550"></a>

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

## Prerequisites
<table>
	<td><b>NOTE:</b> NodeJS 14.x or higher</td>
</table>

To handle several requests from each web, You will also need [Redis](https://redis.io/) for persistent caching, free tier is available on [Redis Labs](https://redislabs.com/), You can also choose another provider as we using [keyv](https://github.com/jaredwray/keyv) Key-value storage with support for multiple backends. All data must be stored in `<Buffer>` here.

## Installation
Rename `.env.schema` to `.env` and fill the value with your own.

```bash
PORT=3000 ## default port
REDIS_URL=redis://default:somenicepassword@someredishost:1337 ## the database url
EXPIRE_CACHE=1 ## should expired in a day
```

### Docker

    docker pull ghcr.io/sinkaroid/jandapress:latest
    docker run -p 3000:3000 -d ghcr.io/sinkaroid/jandapress:latest

### Manual

`git clone https://github.com/sinkaroid/jandapress.git`
- Install dependencies
  - `npm install / yarn install`
- Jandapress production
  - `npm run build`
  - `npm run start:prod`
- Jandapress testings
  - `npm run start:dev`


## Running tests
Jandapress depends on
- [express](https://github.com/expressjs/express) web api framework
- [keyv](https://github.com/jaredwray/keyv) key-value storage with support for multiple backends
- [cheerio](https://cheerio.js.org/) for parsing html
- [cors](https://github.com/expressjs/cors) middleware for enabling CORS
- [rate-limit](https://github.com/nfriedly/express-rate-limit) rate-limiting middleware for express

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
    - https://janda.mod.land/nhentai/get?book=177013
    - https://janda.mod.land/nhentai/search?key=futanari&page=2&sort=popular-today

### Pururin
The missing piece of pururin.to - https://sinkaroid.github.io/jandapress/#api-pururin
- `/pururin` : pururin api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`, `?page`, `?sort`
  - **random**
  - <u>sort parameters on search</u>
    - "newest", "most-popular", "highest-rated", "most-viewed", "title", "random" 
  - Example
    - https://janda.mod.land/pururin/get?book=63373
    - https://janda.mod.land/pururin/search?key=futanari&page=2&sort=most-viewed

### Hentaifox
The missing piece of hentaifox.com - https://sinkaroid.github.io/jandapress/#api-hentaifox
- `/hentaifox`: hentaifox api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`, `?page`, `?sort`
  - **random**
  - <u>sort parameters on search</u>
    - "latest", "popular"
  - Example
    - https://janda.mod.land/hentaifox/get?book=97527
    - https://janda.mod.land/hentaifox/search?key=milf&page=2&sort=latest

### Asmhentai
The missing piece of asmhentai.com - https://sinkaroid.github.io/jandapress/#api-asmhentai
- `/asmhentai`: asmhentai api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`, `?page`
  - **random**
  - <u>sort parameters on search</u>
    - None
  - Example
    - https://janda.mod.land/asmhentai/get?book=416773
    - https://janda.mod.land/asmhentai/search?key=futanari&page=2

### Hentai2read
The missing piece of hentai2read.com - https://sinkaroid.github.io/jandapress/#api-hentai2read
- `/hentai2read`: hentai2read api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`
  - <u>sort parameters on search</u>
    - TBA
  - Example
    - https://janda.mod.land/hentai2read/get?book=butabako_shotaone_matome_fgo_hen/1
    - https://janda.mod.land/hentai2read/search?key=futanari

### Simply-hentai
The missing piece of simply-hentai.com - https://sinkaroid.github.io/jandapress/#api-simply-hentai
- `/simply-hentai`: simply-hentai api
  - **get**, takes parameters : `book`
  - <u>sort parameters on search</u>
    - TBA
  - Example
    - https://janda.mod.land/simply-hentai/get?book=fate-grand-order/fgo-sanbunkatsuhou/all-pages

### 3hentai
The missing piece of 3hentai.net - https://sinkaroid.github.io/jandapress/#api-3hentai
- `/3hentai`: 3hentai api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`, `?page`, `?sort`
  - **random**
  - <u>sort parameters on search</u>
    - "recent", "popular-24h", "popular-7d", "popular"
  - Example
    - https://janda.mod.land/3hentai/get?book=608979
    - https://janda.mod.land/3hentai/search?key=futanari&page=2&sort=popular-7d

## Status response

    HTTP/1.1 200 OK
    HTTP/1.1 200 (cached)
    HTTP/1.1 500 (bad parameters)

## Limitations
Nhentai was cloudflare protection enabled, If IP and our thoughts against them? You should implement a proxy. Check [`cookie branch`](https://github.com/sinkaroid/jandapress/tree/cookie), take a look this workaround [Zekfad/nhentai-api/issues/25#issuecomment-1141360074](https://github.com/Zekfad/nhentai-api/issues/25#issuecomment-1141360074)

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
