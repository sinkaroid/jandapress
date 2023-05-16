define({ "api": [
  {
    "type": "get",
    "url": "/3hentai/get?book=:book",
    "title": "Get 3hentai",
    "name": "Get_3hentai",
    "group": "3hentai",
    "description": "<p>Get a doujinshi on 3hentai based on id</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "book",
            "description": "<p>Book ID</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/3hentai/get?book=123",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/3hentai/get?book=123\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/3hentai/get?book=123\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/3hentai/3hentaiGet.ts",
    "groupTitle": "3hentai",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/3hentai/get?book=:book"
      }
    ]
  },
  {
    "type": "get",
    "url": "/3hentai/random",
    "title": "Random 3hentai",
    "name": "Random_3hentai",
    "group": "3hentai",
    "description": "<p>Gets random doujinshi on 3hentai</p>",
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/3hentai/random",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/3hentai/random\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/3hentai/random\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/3hentai/3hentaiRandom.ts",
    "groupTitle": "3hentai",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/3hentai/random"
      }
    ]
  },
  {
    "type": "get",
    "url": "/3hentai/search",
    "title": "Search 3hentai",
    "name": "Search_3hentai",
    "group": "3hentai",
    "description": "<p>Search doujinshi on 3hentai</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "key",
            "description": "<p>Keyword to search</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "page",
            "defaultValue": "1",
            "description": "<p>Page number</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "sort",
            "defaultValue": "recent",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/3hentai/search?key=yuri\ncurl -i https://janda.sinkaroid.org/3hentai/search?key=yuri&page=2&sort=recent",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/3hentai/search?key=yuri\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/3hentai/search?key=yuri\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/3hentai/3hentaiSearch.ts",
    "groupTitle": "3hentai",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/3hentai/search"
      }
    ]
  },
  {
    "type": "get",
    "url": "/asmhentai/get?book=:book",
    "title": "Get asmhentai",
    "name": "Get_asmhentai",
    "group": "asmhentai",
    "description": "<p>Get a doujinshi on asmhentai based on id</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "book",
            "description": "<p>Book ID</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/asmhentai/get?book=123",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/asmhentai/get?book=123\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/asmhentai/get?book=123\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/asmhentai/asmhentaiGet.ts",
    "groupTitle": "asmhentai",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/asmhentai/get?book=:book"
      }
    ]
  },
  {
    "type": "get",
    "url": "/asmhentai/random",
    "title": "Random asmhentai",
    "name": "Random_asmhentai",
    "group": "asmhentai",
    "description": "<p>Gets random doujinshi on asmhentai</p>",
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/asmhentai/random",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/asmhentai/random\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/asmhentai/random\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/asmhentai/asmhentaiRandom.ts",
    "groupTitle": "asmhentai",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/asmhentai/random"
      }
    ]
  },
  {
    "type": "get",
    "url": "/asmhentai/search",
    "title": "Search asmhentai",
    "name": "Search_asmhentai",
    "group": "asmhentai",
    "description": "<p>Search doujinshi on asmhentai</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "key",
            "description": "<p>Keyword to search</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "page",
            "defaultValue": "1",
            "description": "<p>Page number</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/asmhentai/search?key=yuri",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/asmhentai/search?key=yuri\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/asmhentai/search?key=yuri\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/asmhentai/asmhentaiSearch.ts",
    "groupTitle": "asmhentai",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/asmhentai/search"
      }
    ]
  },
  {
    "type": "get",
    "url": "/hentai2read/get?book=:book",
    "title": "Get hentai2read",
    "name": "Get_hentai2read",
    "group": "hentai2read",
    "description": "<p>Get a doujinshi on hentai2read</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "book",
            "description": "<p>Book path</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/hentai2read/get?book=butabako_shotaone_matome_fgo_hen/1",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/hentai2read/get?book=butabako_shotaone_matome_fgo_hen/1\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/hentai2read/get?book=butabako_shotaone_matome_fgo_hen/1\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/hentai2read/hentai2readGet.ts",
    "groupTitle": "hentai2read",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/hentai2read/get?book=:book"
      }
    ]
  },
  {
    "type": "get",
    "url": "/hentai2read/search",
    "title": "Search hentai2read",
    "name": "Search_hentai2read",
    "group": "hentai2read",
    "description": "<p>Search doujinshi on hentai2read</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "key",
            "description": "<p>Keyword to search</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/hentai2read/search?key=yuri",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/hentai2read/search?key=yuri\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/hentai2read/search?key=yuri\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/hentai2read/hentai2readSearch.ts",
    "groupTitle": "hentai2read",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/hentai2read/search"
      }
    ]
  },
  {
    "type": "get",
    "url": "/hentaifox/get?book=:book",
    "title": "Get hentaifox",
    "name": "Get_hentaifox",
    "group": "hentaifox",
    "description": "<p>Get a doujinshi on hentaifox based on id</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "book",
            "description": "<p>Book ID</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/hentaifox/get?book=123",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/hentaifox/get?book=123\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/hentaifox/get?book=123\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/hentaifox/hentaifoxGet.ts",
    "groupTitle": "hentaifox",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/hentaifox/get?book=:book"
      }
    ]
  },
  {
    "type": "get",
    "url": "/hentaifox/random",
    "title": "Random hentaifox",
    "name": "Random_hentaifox",
    "group": "hentaifox",
    "description": "<p>Gets random doujinshi on hentaifox</p>",
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/hentaifox/random",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/hentaifox/random\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/hentaifox/random\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/hentaifox/hentaifoxRandom.ts",
    "groupTitle": "hentaifox",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/hentaifox/random"
      }
    ]
  },
  {
    "type": "get",
    "url": "/hentaifox/search",
    "title": "Search hentaifox",
    "name": "Search_hentaifox",
    "group": "hentaifox",
    "description": "<p>Search doujinshi on hentaifox</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "key",
            "description": "<p>Keyword to search</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "page",
            "defaultValue": "1",
            "description": "<p>Page number</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "sort",
            "defaultValue": "latest",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/hentaifox/search?key=yuri\ncurl -i https://janda.sinkaroid.org/hentaifox/search?key=yuri&page=2&sort=latest",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/hentaifox/search?key=yuri\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/hentaifox/search?key=yuri\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/hentaifox/hentaifoxSearch.ts",
    "groupTitle": "hentaifox",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/hentaifox/search"
      }
    ]
  },
  {
    "type": "get",
    "url": "/nhentaito/get?book=:book",
    "title": "Get nhentai.to",
    "name": "Get_nhentai.to",
    "group": "nhentai.to",
    "description": "<p>Get a doujinshi on nhentai.to based on id</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "book",
            "description": "<p>Book ID</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/nhentaito/get?book=272",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/nhentaito/get?book=272\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/nhentaito/get?book=272\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/nhentaito/nhentaiToGet.ts",
    "groupTitle": "nhentai.to",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/nhentaito/get?book=:book"
      }
    ]
  },
  {
    "type": "get",
    "url": "/nhentaito/related?book=:book",
    "title": "Get related nhentai.to",
    "name": "Get_related_nhentai.to",
    "group": "nhentai.to",
    "description": "<p>Get a related doujinshi on nhentai.to based on id</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "book",
            "description": "<p>Book ID</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/nhentaito/related?book=272",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/nhentaito/related?book=272\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/nhentaito/related?book=272\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/nhentaito/nhentaiToRelated.ts",
    "groupTitle": "nhentai.to",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/nhentaito/related?book=:book"
      }
    ]
  },
  {
    "type": "get",
    "url": "/nhentaito/random",
    "title": "Random nhentai.to",
    "name": "Random_nhentai.to",
    "group": "nhentai.to",
    "description": "<p>Gets random doujinshi on nhentai.to</p>",
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/nhentaito/random",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/nhentaito/random\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/nhentaito/random\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/nhentaito/nhentaiToRandom.ts",
    "groupTitle": "nhentai.to",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/nhentaito/random"
      }
    ]
  },
  {
    "type": "get",
    "url": "/nhentaito/search",
    "title": "Search nhentai.to",
    "name": "Search_nhentai.to",
    "group": "nhentai.to",
    "description": "<p>Search doujinshi on nhentai.to</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "key",
            "description": "<p>Keyword to search</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "page",
            "defaultValue": "1",
            "description": "<p>Page number</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/nhentaito/search?key=yuri\ncurl -i https://janda.sinkaroid.org/nhentaito/search?key=yuri&page=2",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/nhentaito/search?key=yuri\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/nhentaito/search?key=yuri\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/nhentaito/nhentaiToSearch.ts",
    "groupTitle": "nhentai.to",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/nhentaito/search"
      }
    ]
  },
  {
    "type": "get",
    "url": "/nhentai/get?book=:book",
    "title": "Get nhentai",
    "name": "Get_nhentai",
    "group": "nhentai",
    "description": "<p>Get a doujinshi on nhentai based on id</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "book",
            "description": "<p>Book ID</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/nhentai/get?book=123",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/nhentai/get?book=123\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/nhentai/get?book=123\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/nhentai/nhentaiGet.ts",
    "groupTitle": "nhentai",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/nhentai/get?book=:book"
      }
    ]
  },
  {
    "type": "get",
    "url": "/nhentai/related?book=:book",
    "title": "Get related nhentai",
    "name": "Get_related_nhentai",
    "group": "nhentai",
    "description": "<p>Get related or similar doujinshi on nhentai based on id</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "book",
            "description": "<p>Book ID</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/nhentai/related?book=123",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/nhentai/related?book=123\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/nhentai/related?book=123\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/nhentai/nhentaiRelated.ts",
    "groupTitle": "nhentai",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/nhentai/related?book=:book"
      }
    ]
  },
  {
    "type": "get",
    "url": "/nhentai/random",
    "title": "Random nhentai",
    "name": "Random_nhentai",
    "group": "nhentai",
    "description": "<p>Gets random doujinshi on nhentai</p>",
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/nhentai/random",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/nhentai/random\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/nhentai/random\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/nhentai/nhentaiRandom.ts",
    "groupTitle": "nhentai",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/nhentai/random"
      }
    ]
  },
  {
    "type": "get",
    "url": "/nhentai/search",
    "title": "Search nhentai",
    "name": "Search_nhentai",
    "group": "nhentai",
    "description": "<p>Search doujinshi on nhentai</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "key",
            "description": "<p>Keyword to search</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "page",
            "defaultValue": "1",
            "description": "<p>Page number</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "sort",
            "defaultValue": "popular-today",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/nhentai/search?key=yuri\ncurl -i https://janda.sinkaroid.org/nhentai/search?key=yuri&page=2&sort=popular-today",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/nhentai/search?key=yuri\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/nhentai/search?key=yuri\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/nhentai/nhentaiSearch.ts",
    "groupTitle": "nhentai",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/nhentai/search"
      }
    ]
  },
  {
    "type": "get",
    "url": "/pururin/get?book=:book",
    "title": "Get pururin",
    "name": "Get_pururin",
    "group": "pururin",
    "description": "<p>Get a doujinshi on pururin based on id</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "book",
            "description": "<p>Book ID</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/pururin/get?book=123",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/pururin/get?book=123\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/pururin/get?book=123\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/pururin/pururinGet.ts",
    "groupTitle": "pururin",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/pururin/get?book=:book"
      }
    ]
  },
  {
    "type": "get",
    "url": "/pururin/random",
    "title": "Random pururin",
    "name": "Random_pururin",
    "group": "pururin",
    "description": "<p>Gets random doujinshi on pururin</p>",
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/pururin/random",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/pururin/random\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/pururin/random\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/pururin/pururinRandom.ts",
    "groupTitle": "pururin",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/pururin/random"
      }
    ]
  },
  {
    "type": "get",
    "url": "/pururin/search",
    "title": "Search pururin",
    "name": "Search_pururin",
    "group": "pururin",
    "description": "<p>Search doujinshi on pururin</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "key",
            "description": "<p>Keyword to search</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "page",
            "defaultValue": "1",
            "description": "<p>Page number</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "sort",
            "defaultValue": "newest",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/pururin/search?key=yuri\ncurl -i https://janda.sinkaroid.org/pururin/search?key=yuri&page=2&sort=newest",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/pururin/search?key=yuri\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/pururin/search?key=yuri\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/pururin/pururinSearch.ts",
    "groupTitle": "pururin",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/pururin/search"
      }
    ]
  },
  {
    "type": "get",
    "url": "/simply-hentai/get?book=:book",
    "title": "Get simply-hentai",
    "name": "Get_simply-hentai",
    "group": "simply-hentai",
    "description": "<p>Get a doujinshi on simply-hentai</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "book",
            "description": "<p>Book path</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nHTTP/1.1 400 Bad Request",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "curl",
        "content": "curl -i https://janda.sinkaroid.org/simply-hentai/get?book=fate-grand-order/fgo-sanbunkatsuhou/all-pages",
        "type": "curl"
      },
      {
        "title": "JS/TS",
        "content": "import axios from \"axios\"\n\naxios.get(\"https://janda.sinkaroid.org/simply-hentai/get?book=fate-grand-order/fgo-sanbunkatsuhou/all-pages\")\n.then(res => console.log(res.data))\n.catch(err => console.error(err))",
        "type": "js"
      },
      {
        "title": "Python",
        "content": "import aiohttp\nasync with aiohttp.ClientSession() as session:\n async with session.get(\"https://janda.sinkaroid.org/simply-hentai/get?book=fate-grand-order/fgo-sanbunkatsuhou/all-pages\") as resp:\n   print(await resp.json())",
        "type": "python"
      }
    ],
    "version": "0.0.0",
    "filename": "src/controller/simply-hentai/simply-hentaiGet.ts",
    "groupTitle": "simply-hentai",
    "sampleRequest": [
      {
        "url": "https://janda.sinkaroid.org/simply-hentai/get?book=:book"
      }
    ]
  }
] });