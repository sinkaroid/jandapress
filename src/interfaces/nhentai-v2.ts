export interface NhentaiV2GallerySummary {
  id: number;
  media_id: string;
  english_title: string;
  japanese_title: string;
  thumbnail: string;
  thumbnail_width: number;
  thumbnail_height: number;
  num_pages: number;
  tag_ids: number[];
  blacklisted: boolean;
}

export interface NhentaiV2ListResponse {
  result: NhentaiV2GallerySummary[];
  num_pages: number;
  per_page: number;
  total: number;
}

export interface NhentaiV2RelatedResponse {
  result: NhentaiV2GallerySummary[];
}

export interface NhentaiV2Tag {
  id: number;
  type: string;
  name: string;
  slug: string;
  url: string;
  count: number;
}

export interface NhentaiV2Page {
  number: number;
  path: string;
  width: number;
  height: number;
  thumbnail: string;
  thumbnail_width: number;
  thumbnail_height: number;
}

export interface NhentaiV2Detail {
  id: number;
  media_id: string;
  title: {
    english: string;
    japanese: string;
    pretty: string;
  };
  scanlator: string;
  upload_date: number;
  tags: Array<{ type: string; name: string }>;
  num_pages: number;
  num_favorites: number;
  pages: NhentaiV2Page[];
}
