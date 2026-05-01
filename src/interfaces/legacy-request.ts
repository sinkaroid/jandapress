import type { LegacyQuery } from "../types/legacy-query";

export interface LegacyRequest {
  query: LegacyQuery;
  params: Record<string, string>;
  path: string;
  method: string;
  ip: string;
  url: string;
  get(_name: string): string | undefined;
}