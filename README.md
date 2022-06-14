<div align="center">
<a href="https://janda.mod.land"><img width="500" src="https://cdn.discordapp.com/attachments/952117487166705747/986185787894812672/tomoe-janda.png" alt="jandapress"></a>

<h4 align="center">RESTful and experimental API for the doujinboards</h4>
<p align="center">
	<a href="https://github.com/sinkaroid/jandapress/actions/workflows/status.yml"><img src="https://github.com/sinkaroid/jandapress/actions/workflows/status.yml/badge.svg"></a>
	<a href="https://codeclimate.com/github/sinkaroid/jandapress/maintainability"><img src="https://api.codeclimate.com/v1/badges/829b8fe63ab78a425f0b/maintainability" /></a>
</p>

jandapresspress was named **JCE** (jandapress Cheerio Express) and definitely depends on them.  
The motivation of this project is to bring you an actionable data related doujin with gather in mind.

<a href="https://github.com/sinkaroid/jandapress/blob/master/CONTRIBUTING.md">Contributing</a> •
<a href="https://github.com/sinkaroid/jandapress/blob/master/README.md#routing">Documentation</a> •
<a href="https://github.com/sinkaroid/jandapress/issues/new/choose">Report Issues</a>
</div>

---

## The problem
You enjoy using some doujin sites to build web applications. There are a lot sites that have effort especially pururin, simply-hentai and so on, not official api available nor public resource that can be used for everyone. Instead make lots of abstraction or enumerating them manually, You can rely on jandapress to make less of pain.

## The solution
Luckily there are solutions. Jandapress is here

## Routing

- `/` : Index page
- `/nhentai` : nhentai api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `query`, `?page`, `?sort`
  - **related**, takes parameters : `book`
  - **random**
  - Example: https://janda.mod.land/nhentai/get?book=177013

- `/pururin` : pururin api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `query`, `?page`, `?sort`
  - **random**
  - Example: https://janda.mod.land/pururin/get?book=63373

- `/hentaifox`: hentaifox api
  - **get**, takes parameters : `book`
  - **search**, takes parameters : `query`, `?page`, `?sort`
  - **random**
  - Example: https://janda.mod.land/hentaifox/get?book=97527

- `/asmhentai`: asmhentai api
  - get
	- takes parameters : `book`
  - search
    - takes parameters : `query`, `?page`
  - random

- `/hentai2read`: hentai2read api
  - get
	- takes parameters : `book`
  - search
    - takes parameters : `query`

- `/simply-hentai`: simply-hentai api
  - get
    - takes parameters : `book`