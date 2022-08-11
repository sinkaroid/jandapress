<div align="center">
<a href="https://janda.sinkaroid.org"><img width="500" src="https://cdn.discordapp.com/attachments/952117487166705747/986185787894812672/tomoe-janda.png" alt="jandapress"></a>

<h4 align="center">RESTful and experimental API for the doujinboards</h4>
<p align="center">
	<a href="https://github.com/sinkaroid/jandapress/actions/workflows/status.yml"><img src="https://github.com/sinkaroid/jandapress/actions/workflows/status.yml/badge.svg"></a>
	<a href="https://codeclimate.com/github/sinkaroid/jandapress/maintainability"><img src="https://api.codeclimate.com/v1/badges/829b8fe63ab78a425f0b/maintainability" /></a>
</p>

Jandapress was named **JCE** (Janda Cheerio Express) and definitely depends on them.  
The motivation of this project is to bring you an actionable data related doujin with gather in mind.

<a href="https://github.com/sinkaroid/jandapress/blob/master/CONTRIBUTING.md">Contributing</a> •
<a href="https://github.com/sinkaroid/jandapress/blob/master/README.md#routing">Documentation</a> •
<a href="https://github.com/sinkaroid/jandapress/issues/new/choose">Report Issues</a>
</div>

---

<a href="https://janda.sinkaroid.org"><img align="right" src="https://cdn.discordapp.com/attachments/952117487166705747/986315079802814524/tomoe.png" width="300"></a>

- [Jandapress](#)
  - [The problem](#the-problem)
  - [The solution](#the-solution)
  - [Features](#features)
    - [Jandapress vs the whole doujin sites](#jandapress-vs-the-doujinboards)
  - [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Running tests](#running-tests)
  - [Routing](#routing)
    - [nhentai-api](#routing)
    - [pururin-api](#routing)
    - [hentaifox-api](#routing)
    - [asmhentai-api](#routing)
    - [hentai2read-api](#routing)
    - [simply-hentai-api](#routing)
  - [Limitations](#limitations)
  - [Pronunciation](#Pronunciation)
  - [Legal](#legal)
  - [FAQ](#Frequently-asked-questions)
  - [Client libraries / Wrappers](#client-libraries--wrappers)


## The problem
You enjoy consume doujin sites to build web applications. There are a lot sites that have effort especially pururin, simply-hentai and etc, not official api available nor public resource that can be used for everyone. Instead making lot of abstraction and enumerating them manually, You can rely on jandapress to make less of pain. The current state is FREE to use, meant all anonymous usage is allowed no aunthentication required and CORS was enabled.

## The solution
Luckily there are solutions. You can rely on Jandapress.

## Features

- Gather the most doujin sites
- Objects taken that are consistent structure, almost
- Objects taken is re-appended to make it more actionable
- All in one: get, search, and random methods
- In the future we may implement JWT authentication
- Pure scraping

## Jandapress vs. the whole doujin sites

| Site            | Status                                                                                                                                                                            | Get | Search | Random |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ------ | ------ |
| `nhentai`       | [![Nhentai](https://github.com/sinkaroid/jandapress/workflows/Nhentai%20test/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/nhentai.yml)                   | ✅  | ✅     | ✅     |
| `pururin`       | [![Pururin](https://github.com/sinkaroid/jandapress/workflows/Pururin%20test/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/pururin.yml)                  | ✅  | ✅     | ✅     |
| `hentaifox`     | [![Hentaifox](https://github.com/sinkaroid/jandapress/workflows/Hentaifox%20test/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/hentaifox.yml)             | ✅  | ✅     | ✅     |
| `hentai2read`   | [![Hentai2read](https://github.com/sinkaroid/jandapress/workflows/Hentai2read%20test/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/hentai2read.yml)       | ✅  | ✅     | ❌      |
| `simply-hentai` | [![Simply-hentai](https://github.com/sinkaroid/jandapress/workflows/Simply-hentai%20test/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/simply-hentai.yml) | ✅  | ❌      | ❌      |
| `asmhentai`     | [![Asmhentai](https://github.com/sinkaroid/jandapress/workflows/Asmhentai%20test/badge.svg)](https://github.com/sinkaroid/jandapress/actions/workflows/asmhentai.yml)            | ✅  | ✅     | ✅     |

## 🚀Installation

- Clone this repository
  - `git clone https://github.com/sinkaroid/jandapress.git`
- Install dependencies
  - `npm install / yarn install`
- Run Jandapress
  - `npm run start:prod` / `npm run start:dev`

## Prerequisites
<table>
	<td><b>NOTE:</b> NodeJS 14.x or higher</td>
</table>

## Running tests

### Start the production server
`npm run start:prod`

### Running development server
`npm run start:dev`

### Check the whole sites, It's available for scraping or not
`npm run test`

### Check nhentai It's under cloudflare protection or not
`npm run test:cf`

> To running other method, you can see object scripts in file `package.json`, Default port is `3000`

## Routing
the `parameter?`: means is optional.

- `/` : index page
- `/nhentai` : nhentai api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`, `?page`, `?sort`
  - **related**, takes parameters : `book`
  - **random**
  - Example
    - https://janda.sinkaroid.org/nhentai/get?book=177013

- `/pururin` : pururin api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`, `?page`, `?sort`
  - **random**
  - Example
    - https://janda.sinkaroid.org/pururin/get?book=63373

- `/hentaifox`: hentaifox api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`, `?page`, `?sort`
  - **random**
  - Example
    - https://janda.sinkaroid.org/hentaifox/get?book=97527

- `/asmhentai`: asmhentai api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`, `?page`
  - **random**
  - Example
    - https://janda.sinkaroid.org/hentaifox/get?book=308830

- `/hentai2read`: hentai2read api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `key`
  - Example
    - https://janda.sinkaroid.org/hentai2read/get?book=butabako_shotaone_matome_fgo_hen/1

- `/simply-hentai`: simply-hentai api
  - **get**, takes parameters : `book`
  - Example
    - https://janda.sinkaroid.org/simply-hentai/get?book=fate-grand-order/fgo-sanbunkatsuhou/all-pages

## Limitations
Nhentai was cloudflare protection enabled, If IP and our thoughts against them? You should implement a proxy. Check [`cookie branch`](https://github.com/sinkaroid/jandapress/tree/cookie), take a look this workaround [Zekfad/nhentai-api/issues/25#issuecomment-1141360074](https://github.com/Zekfad/nhentai-api/issues/25#issuecomment-1141360074)

## Frequently asked questions 
**Q: The website response is slow**  
*That's unfortunate, This repository was opensource already, You can host and deploy Jandapress with your own instance. Any fixes and improvements will updating to this repo.*

**Q: I dont want to host my own instance**   
*That's unfortunate, Feel free to hit the "Sponsor this project" button, any kind of donations will helps us to funding the development.*

## Pronunciation
[`id_ID`](https://www.localeplanet.com/java/id-ID/index.html) • **/jan·da/** — dewasa dan mengikat; _(?)_


## Client libraries / Wrappers
- [janda](https://github.com/sinkaroid/janda) Python wrapper by [sinkaroid](https://github.com/sinkaroid)
- Or [create your own](https://github.com/sinkaroid/jandapress/edit/master/README.md)

## Legal
This tool can be freely copied, modified, altered, distributed without any attribution whatsoever. However, if you feel
like this tool deserves an attribution, mention it. It won't hurt anybody  

> Licence: WTF.