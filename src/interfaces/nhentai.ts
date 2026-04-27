export interface INhentaiGet {
  title: string;
  optional_title: object;
  id: number;
  language: string;
  tags: string[];
  total: number;
  image: string[];
  num_pages: number;
  num_favorites: number;
  artist: string[];
  group: string;
  parodies: string[];
  characters: string[];
  upload_date: string;
}

interface INhentaiTitle {
  english: string;
  japanese: string;
  pretty: string;
}

export interface INhentaiRelated {
  title: INhentaiTitle;
  id: number;
  language: string;
  upload_date: string;
  total: number;
  tags: string[];
}

export interface INhentaiSearch {
  title: INhentaiTitle;
  id: number;
  language: string;
  upload_date: string;
  total: number;
  cover: string;
  tags: string[];
}
