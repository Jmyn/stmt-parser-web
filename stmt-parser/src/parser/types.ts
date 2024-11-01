import type { Statement } from "../types.ts";

export interface StatementParser {
  parse(buffer: ArrayBuffer): Promise<Statement>;
}
