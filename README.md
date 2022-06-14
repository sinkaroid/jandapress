<div align="center">
<a href="https://janda.mod.land"><img width="450" src="https://cdn.discordapp.com/attachments/952117487166705747/986172809954881556/jandapress-tomoe.png" alt="jandapress"></a>

<h4 align="center">RESTful and experimental API for the doujinboards</h4>
<p align="center">
	<a href="https://github.com/sinkaroid/jandapress/actions/workflows/status.yml"><img src="https://github.com/sinkaroid/jandapress/actions/workflows/status.yml/badge.svg"></a>
	<a href="https://codeclimate.com/github/sinkaroid/jandapress/maintainability"><img src="https://api.codeclimate.com/v1/badges/829b8fe63ab78a425f0b/maintainability" /></a>
</p>

jandapresspress was named **JCE** (jandapress Cherrio Express) and definitely depends on them.  
The motivation of this project is to bring you an actionable data related doujin with gather in mind.

<a href="https://github.com/sinkaroid/jandapress/blob/master/CONTRIBUTING.md">Contributing</a> •
<a href="https://github.com/sinkaroid/jandapress/blob/master/README.md#routing">Documentation</a> •
<a href="https://github.com/sinkaroid/jandapress/issues/new/choose">Report Issues</a>
</div>

---

## Routing

- `/` : Index page
- `/nhentai` : nhentai api
  - get
    - takes parameters : `book`
  - search
    - takes parameters : `query`, `?page`, `?sort`
  - related
    - takes parameters : `book`
  - random

- `/pururin` : pururin api
  - get
	- takes parameters : `book`
  - search
	- takes parameters : `query`, `?page`, `?sort`
  - random

- `/hentaifox`: hentaifox api
  - get
    - takes parameters : `book`
  - search
	- takes parameters : `query`, `?page`, `?sort`
  - random

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