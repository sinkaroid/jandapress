import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import c from "../utils/options";
import { mock } from "../utils/modifier";
import {
  nhentaiGetUrl,
  nhentaiRelatedUrl,
  nhentaiSearchUrl,
  nhentaiRandomUrl,
} from "../utils/nhentai";
import { scrapeContent as nhentaiGetScrape } from "../scraper/nhentai/nhentaiGetController";
import { scrapeContent as nhentaiSearchScrape } from "../scraper/nhentai/nhentaiSearchController";
import { scrapeContent as nhentaiRelatedScrape } from "../scraper/nhentai/nhentaiRelatedController";
import { scrapeContent as pururinGetScrape } from "../scraper/pururin/pururinGetController";
import { scrapeContent as pururinRandomScrape } from "../scraper/pururin/pururinGetControllerRandom";
import { scrapeContent as pururinSearchScrape } from "../scraper/pururin/pururinSearchController";
import { scrapeContent as hentaifoxGetScrape } from "../scraper/hentaifox/hentaifoxGetController";
import { scrapeContent as hentaifoxSearchScrape } from "../scraper/hentaifox/hentaifoxSearchController";
import { scrapeContent as asmhentaiGetScrape } from "../scraper/asmhentai/asmhentaiGetController";
import { scrapeContent as asmhentaiSearchScrape } from "../scraper/asmhentai/asmhentaiSearchController";
import { scrapeContent as hentai2readGetScrape } from "../scraper/hentai2read/hentai2readGetController";
import { scrapeContent as hentai2readSearchScrape } from "../scraper/hentai2read/hentai2readSearchController";
import { scrapeContent as simplyHentaiGetScrape } from "../scraper/simply-hentai/simply-hentaiGetController";
import { scrapeContent as threehentaiGetScrape } from "../scraper/3hentai/3hentaiGetController";
import { scrapeContent as threehentaiSearchScrape } from "../scraper/3hentai/3hentaiSearchController";

// ─── NHentaiTitle ──────────────────────────────────
const NHentaiTitleType = new GraphQLObjectType({
  name: "NHentaiTitle",
  fields: {
    english: { type: GraphQLString },
    japanese: { type: GraphQLString },
    pretty: { type: GraphQLString },
  },
});

// ─── NHentai.Get ──────────────────────────────────
const NHentaiGetDataType = new GraphQLObjectType({
  name: "NHentaiGetData",
  fields: {
    title: { type: GraphQLString },
    optional_title: { type: NHentaiTitleType },
    id: { type: GraphQLInt },
    language: { type: GraphQLString },
    tags: { type: new GraphQLList(GraphQLString) },
    total: { type: GraphQLInt },
    image: { type: new GraphQLList(GraphQLString) },
    num_pages: { type: GraphQLInt },
    num_favorites: { type: GraphQLInt },
    artist: { type: new GraphQLList(GraphQLString) },
    group: { type: GraphQLString },
    parodies: { type: new GraphQLList(GraphQLString) },
    characters: { type: new GraphQLList(GraphQLString) },
    upload_date: { type: GraphQLString },
  },
});

const NHentaiGetResultType = new GraphQLObjectType({
  name: "NHentaiGetResult",
  fields: {
    success: { type: GraphQLBoolean },
    data: { type: NHentaiGetDataType },
    source: { type: GraphQLString },
  },
});

// ─── NHentai.Search ───────────────────────────────
const NHentaiSearchDataType = new GraphQLObjectType({
  name: "NHentaiSearchData",
  fields: {
    title: { type: NHentaiTitleType },
    id: { type: GraphQLInt },
    language: { type: GraphQLString },
    upload_date: { type: GraphQLString },
    total: { type: GraphQLInt },
    cover: { type: GraphQLString },
    tags: { type: new GraphQLList(GraphQLString) },
  },
});

const NHentaiSearchResultType = new GraphQLObjectType({
  name: "NHentaiSearchResult",
  fields: {
    success: { type: GraphQLBoolean },
    data: { type: new GraphQLList(NHentaiSearchDataType) },
    page: { type: GraphQLInt },
    sort: { type: GraphQLString },
    source: { type: GraphQLString },
  },
});

// ─── NHentai.Related ──────────────────────────────
const NHentaiRelatedDataType = new GraphQLObjectType({
  name: "NHentaiRelatedData",
  fields: {
    title: { type: NHentaiTitleType },
    id: { type: GraphQLInt },
    language: { type: GraphQLString },
    upload_date: { type: GraphQLString },
    total: { type: GraphQLInt },
    tags: { type: new GraphQLList(GraphQLString) },
  },
});

const NHentaiRelatedResultType = new GraphQLObjectType({
  name: "NHentaiRelatedResult",
  fields: {
    success: { type: GraphQLBoolean },
    data: { type: new GraphQLList(NHentaiRelatedDataType) },
    source: { type: GraphQLString },
  },
});

// ─── NHentai queries ──────────────────────────────
const NHentaiQueriesType = new GraphQLObjectType({
  name: "NHentaiQueries",
  fields: {
    get: {
      type: NHentaiGetResultType,
      args: { book: { type: GraphQLInt } },
      resolve: async (_: unknown, args: { book: number }) => {
        const url = nhentaiGetUrl(String(args.book));
        return nhentaiGetScrape(url);
      },
    },
    search: {
      type: NHentaiSearchResultType,
      args: {
        key: { type: GraphQLString },
        page: { type: GraphQLInt, defaultValue: 1 },
        sort: { type: GraphQLString, defaultValue: "date" },
      },
      resolve: async (_: unknown, args: { key: string; page: number; sort: string }) => {
        const url = nhentaiSearchUrl(args.key, args.page, args.sort);
        return nhentaiSearchScrape(url);
      },
    },
    random: {
      type: NHentaiGetResultType,
      resolve: async () => {
        const url = nhentaiRandomUrl();
        return nhentaiGetScrape(url, true);
      },
    },
    related: {
      type: NHentaiRelatedResultType,
      args: { book: { type: GraphQLInt } },
      resolve: async (_: unknown, args: { book: number }) => {
        const url = nhentaiRelatedUrl(String(args.book));
        return nhentaiRelatedScrape(url);
      },
    },
  },
});

// ─── Pururin.Get ──────────────────────────────────
const PururinGetDataType = new GraphQLObjectType({
  name: "PururinGetData",
  fields: {
    title: { type: GraphQLString },
    id: { type: GraphQLInt },
    tags: { type: new GraphQLList(GraphQLString) },
    extension: { type: GraphQLString },
    total: { type: GraphQLInt },
    image: { type: new GraphQLList(GraphQLString) },
  },
});

const PururinGetResultType = new GraphQLObjectType({
  name: "PururinGetResult",
  fields: {
    success: { type: GraphQLBoolean },
    data: { type: PururinGetDataType },
    source: { type: GraphQLString },
  },
});

// ─── Pururin.Search ───────────────────────────────
const PururinSearchDataType = new GraphQLObjectType({
  name: "PururinSearchData",
  fields: {
    title: { type: GraphQLString },
    cover: { type: GraphQLString },
    id: { type: GraphQLInt },
    language: { type: GraphQLString },
    info: { type: GraphQLString },
    link: { type: GraphQLString },
    total: { type: GraphQLInt },
  },
});

const PururinSearchResultType = new GraphQLObjectType({
  name: "PururinSearchResult",
  fields: {
    success: { type: GraphQLBoolean },
    data: { type: new GraphQLList(PururinSearchDataType) },
    page: { type: GraphQLInt },
    sort: { type: GraphQLString },
    source: { type: GraphQLString },
  },
});

// ─── Pururin queries ──────────────────────────────
const PururinQueriesType = new GraphQLObjectType({
  name: "PururinQueries",
  fields: {
    get: {
      type: PururinGetResultType,
      args: { book: { type: GraphQLInt } },
      resolve: async (_: unknown, args: { book: number }) => {
        const url = `${c.PURURIN}/gallery/${args.book}/janda`;
        return pururinGetScrape(url);
      },
    },
    search: {
      type: PururinSearchResultType,
      args: {
        key: { type: GraphQLString },
        page: { type: GraphQLInt, defaultValue: 1 },
      },
      resolve: async (_: unknown, args: { key: string; page: number }) => {
        const url = `${c.PURURIN}/search?q=${args.key}&page=${args.page}`;
        return pururinSearchScrape(url);
      },
    },
    random: {
      type: PururinGetResultType,
      resolve: async () => {
        const url = `${c.PURURIN}/random`;
        return pururinRandomScrape(url, true);
      },
    },
  },
});

// ─── Hentaifox.Get ────────────────────────────────
const HentaifoxGetDataType = new GraphQLObjectType({
  name: "HentaifoxGetData",
  fields: {
    title: { type: GraphQLString },
    id: { type: GraphQLInt },
    tags: { type: new GraphQLList(GraphQLString) },
    type: { type: GraphQLString },
    total: { type: GraphQLInt },
    image: { type: new GraphQLList(GraphQLString) },
  },
});

const HentaifoxGetResultType = new GraphQLObjectType({
  name: "HentaifoxGetResult",
  fields: {
    success: { type: GraphQLBoolean },
    data: { type: HentaifoxGetDataType },
    source: { type: GraphQLString },
  },
});

// ─── Hentaifox.Search ─────────────────────────────
const HentaifoxSearchDataType = new GraphQLObjectType({
  name: "HentaifoxSearchData",
  fields: {
    title: { type: GraphQLString },
    cover: { type: GraphQLString },
    id: { type: GraphQLInt },
    language: { type: GraphQLString },
    category: { type: GraphQLString },
    link: { type: GraphQLString },
  },
});

const HentaifoxSearchResultType = new GraphQLObjectType({
  name: "HentaifoxSearchResult",
  fields: {
    success: { type: GraphQLBoolean },
    data: { type: new GraphQLList(HentaifoxSearchDataType) },
    page: { type: GraphQLInt },
    sort: { type: GraphQLString },
    source: { type: GraphQLString },
  },
});

// ─── Hentaifox queries ────────────────────────────
const HentaifoxQueriesType = new GraphQLObjectType({
  name: "HentaifoxQueries",
  fields: {
    get: {
      type: HentaifoxGetResultType,
      args: { book: { type: GraphQLInt } },
      resolve: async (_: unknown, args: { book: number }) => {
        const url = `${c.HENTAIFOX}/gallery/${args.book}/`;
        return hentaifoxGetScrape(url);
      },
    },
    search: {
      type: HentaifoxSearchResultType,
      args: {
        key: { type: GraphQLString },
        page: { type: GraphQLInt, defaultValue: 1 },
        sort: { type: GraphQLString, defaultValue: "latest" },
      },
      resolve: async (_: unknown, args: { key: string; page: number; sort: string }) => {
        const url = `${c.HENTAIFOX}/search/?q=${args.key}&sort=${args.sort}&page=${args.page}`;
        return hentaifoxSearchScrape(url);
      },
    },
    random: {
      type: HentaifoxGetResultType,
      resolve: async () => {
        const url = `${c.HENTAIFOX}/random`;
        return hentaifoxGetScrape(url);
      },
    },
  },
});

// ─── Asmhentai.Get ────────────────────────────────
const AsmhentaiGetDataType = new GraphQLObjectType({
  name: "AsmhentaiGetData",
  fields: {
    title: { type: GraphQLString },
    id: { type: GraphQLInt },
    tags: { type: new GraphQLList(GraphQLString) },
    total: { type: GraphQLInt },
    image: { type: new GraphQLList(GraphQLString) },
    upload_date: { type: GraphQLString },
  },
});

const AsmhentaiGetResultType = new GraphQLObjectType({
  name: "AsmhentaiGetResult",
  fields: {
    success: { type: GraphQLBoolean },
    data: { type: AsmhentaiGetDataType },
    source: { type: GraphQLString },
  },
});

// ─── Asmhentai.Search ─────────────────────────────
const AsmhentaiSearchDataType = new GraphQLObjectType({
  name: "AsmhentaiSearchData",
  fields: {
    title: { type: GraphQLString },
    id: { type: GraphQLInt },
  },
});

const AsmhentaiSearchResultType = new GraphQLObjectType({
  name: "AsmhentaiSearchResult",
  fields: {
    success: { type: GraphQLBoolean },
    data: { type: new GraphQLList(AsmhentaiSearchDataType) },
    page: { type: GraphQLInt },
    sort: { type: GraphQLString },
    source: { type: GraphQLString },
  },
});

// ─── Asmhentai queries ────────────────────────────
const AsmhentaiQueriesType = new GraphQLObjectType({
  name: "AsmhentaiQueries",
  fields: {
    get: {
      type: AsmhentaiGetResultType,
      args: { book: { type: GraphQLInt } },
      resolve: async (_: unknown, args: { book: number }) => {
        const url = `${c.ASMHENTAI}/g/${args.book}/`;
        return asmhentaiGetScrape(url);
      },
    },
    search: {
      type: AsmhentaiSearchResultType,
      args: {
        key: { type: GraphQLString },
        page: { type: GraphQLInt, defaultValue: 1 },
      },
      resolve: async (_: unknown, args: { key: string; page: number }) => {
        const url = `${c.ASMHENTAI}/search/?q=${args.key}&page=${args.page}`;
        return asmhentaiSearchScrape(url);
      },
    },
    random: {
      type: AsmhentaiGetResultType,
      resolve: async () => {
        const url = `${c.ASMHENTAI}/random/`;
        return asmhentaiGetScrape(url);
      },
    },
  },
});

// ─── Hentai2read.Get ──────────────────────────────
const Hentai2readGetDataType = new GraphQLObjectType({
  name: "Hentai2readGetData",
  fields: {
    title: { type: GraphQLString },
    id: { type: GraphQLString },
    image: { type: new GraphQLList(GraphQLString) },
  },
});

const Hentai2readGetResultType = new GraphQLObjectType({
  name: "Hentai2readGetResult",
  fields: {
    success: { type: GraphQLBoolean },
    data: { type: Hentai2readGetDataType },
    main_url: { type: GraphQLString },
    current_url: { type: GraphQLString },
    next_url: { type: GraphQLString },
    previus_url: { type: GraphQLString },
    source: { type: GraphQLString },
  },
});

// ─── Hentai2read.Search ───────────────────────────
const Hentai2readSearchDataType = new GraphQLObjectType({
  name: "Hentai2readSearchData",
  fields: {
    title: { type: GraphQLString },
    cover: { type: GraphQLString },
    id: { type: GraphQLString },
    link: { type: GraphQLString },
    message: { type: GraphQLString },
  },
});

const Hentai2readSearchResultType = new GraphQLObjectType({
  name: "Hentai2readSearchResult",
  fields: {
    data: { type: new GraphQLList(Hentai2readSearchDataType) },
    source: { type: GraphQLString },
  },
});

// ─── Hentai2read queries ──────────────────────────
const Hentai2readQueriesType = new GraphQLObjectType({
  name: "Hentai2readQueries",
  fields: {
    get: {
      type: Hentai2readGetResultType,
      args: { book: { type: GraphQLString } },
      resolve: async (_: unknown, args: { book: string }) => {
        const url = `${c.HENTAI2READ}/${args.book}/`;
        return hentai2readGetScrape(url);
      },
    },
    search: {
      type: Hentai2readSearchResultType,
      args: {
        key: { type: GraphQLString },
        page: { type: GraphQLInt, defaultValue: 1 },
      },
      resolve: async (_: unknown, args: { key: string }) => {
        const url = `${c.HENTAI2READ}/hentai-list/search/${args.key}`;
        return hentai2readSearchScrape(url);
      },
    },
  },
});

// ─── SimplyHentai.Get ─────────────────────────────
const SimplyHentaiGetDataType = new GraphQLObjectType({
  name: "SimplyHentaiGetData",
  fields: {
    title: { type: GraphQLString },
    id: { type: GraphQLString },
    tags: { type: new GraphQLList(GraphQLString) },
    total: { type: GraphQLInt },
    image: { type: new GraphQLList(GraphQLString) },
    language: { type: GraphQLString },
  },
});

const SimplyHentaiGetResultType = new GraphQLObjectType({
  name: "SimplyHentaiGetResult",
  fields: {
    success: { type: GraphQLBoolean },
    data: { type: SimplyHentaiGetDataType },
    source: { type: GraphQLString },
  },
});

// ─── SimplyHentai queries ─────────────────────────
const SimplyHentaiQueriesType = new GraphQLObjectType({
  name: "SimplyHentaiQueries",
  fields: {
    get: {
      type: SimplyHentaiGetResultType,
      args: { book: { type: GraphQLString } },
      resolve: async (_: unknown, args: { book: string }) => {
        let actualAPI = c.SIMPLY_HENTAI;
        if (!await mock(c.SIMPLY_HENTAI)) actualAPI = c.SIMPLY_HENTAI_PROXIFIED;
        const url = `${actualAPI}/${args.book}`;
        return simplyHentaiGetScrape(url);
      },
    },
  },
});

// ─── 3hentai.Get ──────────────────────────────────
const ThreehentaiGetDataType = new GraphQLObjectType({
  name: "ThreehentaiGetData",
  fields: {
    title: { type: GraphQLString },
    id: { type: GraphQLInt },
    tags: { type: new GraphQLList(GraphQLString) },
    total: { type: GraphQLInt },
    image: { type: new GraphQLList(GraphQLString) },
    upload_date: { type: GraphQLString },
  },
});

const ThreehentaiGetResultType = new GraphQLObjectType({
  name: "ThreehentaiGetResult",
  fields: {
    success: { type: GraphQLBoolean },
    data: { type: ThreehentaiGetDataType },
    source: { type: GraphQLString },
  },
});

// ─── 3hentai.Search ───────────────────────────────
const ThreehentaiSearchDataType = new GraphQLObjectType({
  name: "ThreehentaiSearchData",
  fields: {
    title: { type: GraphQLString },
    id: { type: GraphQLInt },
  },
});

const ThreehentaiSearchResultType = new GraphQLObjectType({
  name: "ThreehentaiSearchResult",
  fields: {
    success: { type: GraphQLBoolean },
    data: { type: new GraphQLList(ThreehentaiSearchDataType) },
    page: { type: GraphQLInt },
    sort: { type: GraphQLString },
    source: { type: GraphQLString },
  },
});

// ─── 3hentai queries ──────────────────────────────
const ThreehentaiQueriesType = new GraphQLObjectType({
  name: "ThreehentaiQueries",
  fields: {
    get: {
      type: ThreehentaiGetResultType,
      args: { book: { type: GraphQLInt } },
      resolve: async (_: unknown, args: { book: number }) => {
        const url = `${c.THREEHENTAI}/d/${args.book}`;
        return threehentaiGetScrape(url);
      },
    },
    search: {
      type: ThreehentaiSearchResultType,
      args: {
        key: { type: GraphQLString },
        page: { type: GraphQLInt, defaultValue: 1 },
        sort: { type: GraphQLString, defaultValue: "recent" },
      },
      resolve: async (_: unknown, args: { key: string; page: number; sort: string }) => {
        const url = `${c.THREEHENTAI}/search?q=${args.key}&page=${args.page}&sort=${args.sort}`;
        return threehentaiSearchScrape(url);
      },
    },
    random: {
      type: ThreehentaiGetResultType,
      resolve: async () => {
        const url = `${c.THREEHENTAI}/random`;
        return threehentaiGetScrape(url);
      },
    },
  },
});

// ─── Root Query ───────────────────────────────────
const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    nhentai: {
      type: NHentaiQueriesType,
      resolve: () => ({}),
    },
    pururin: {
      type: PururinQueriesType,
      resolve: () => ({}),
    },
    hentaifox: {
      type: HentaifoxQueriesType,
      resolve: () => ({}),
    },
    asmhentai: {
      type: AsmhentaiQueriesType,
      resolve: () => ({}),
    },
    hentai2read: {
      type: Hentai2readQueriesType,
      resolve: () => ({}),
    },
    simplyHentai: {
      type: SimplyHentaiQueriesType,
      resolve: () => ({}),
    },
    threehentai: {
      type: ThreehentaiQueriesType,
      resolve: () => ({}),
    },
  },
});

export const schema = new GraphQLSchema({ query: QueryType });
