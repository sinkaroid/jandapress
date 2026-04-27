export interface NhentaiLegacy {
  id: number;
  media_id: string;
  title: {
    english: string;
    japanese: string;
    pretty: string;
  };
  images: {
    pages: Array<{
      t: string;
      w: number;
      h: number;
    }>;
  };
  scanlator: string | "";
  upload_date: number;
  tags: Array<{
    id: number;
    type: string;
    name: string;
    url: string;
    count: number;
  }>;
  num_pages: number;
  num_favorites: number;
}
