import type { LegacyRequest } from "../interfaces/legacy-request";
import type { LegacyResponse } from "../interfaces/legacy-response";

export type LegacyHandler = (req: LegacyRequest, res: LegacyResponse) => unknown | Promise<unknown>;