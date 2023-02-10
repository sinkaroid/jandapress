export interface Nhentai {
    id: number;
    media_id: string;
    title: Title;
    images: { pages: P[]}
    scanlator: string | "";
    upload_date: number;
    tags: T[];
    num_pages: number;
    num_favorites: number;
}

export interface NhentaiSearch {
    result: Nhentai[];
}

interface Title {
    english: string;
    japanese: string;
    pretty: string;
}

interface P {
    t: string;
    w: number;
    h: number;
}

interface T {
    id: number;
    type: string;
    name: string;
    url: string;
    count: number;
}

export interface MaybeError {
    message: string;
}

