export interface HeaderReader {
  get(_name: string): string | null | undefined;
}