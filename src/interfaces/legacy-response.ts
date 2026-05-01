export interface LegacyResponse {
  status(code: number): LegacyResponse;
  set(field: string, value: string): LegacyResponse;
  json(payload: unknown): unknown;
  send(payload: unknown): unknown;
  redirect(statusOrUrl: number | string, maybeUrl?: string): unknown;
}