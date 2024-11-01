import type { StatementSource, StatementType } from "../types.ts";
import { CdcDebitParser } from "./cdc/debit.ts";
import { CitibankCreditParser } from "./citibank/credit.ts";
import { OcbcCreditParser } from "./ocbc/credit.ts";
import { OcbcDebitParser } from "./ocbc/debit.ts";
import type { StatementParser } from "./types.ts";
import { UobCreditParser } from "./uob/credit.ts";

export const ParserRecord: Record<
  StatementSource,
  Partial<Record<StatementType, StatementParser>>
> = {
  "ocbc": {
    "debit": new OcbcDebitParser(),
    "credit": new OcbcCreditParser(),
  },
  "citibank": {
    credit: new CitibankCreditParser(),
  },
  "uob": {
    credit: new UobCreditParser(),
  },
  "cdc": {
    debit: new CdcDebitParser(),
  },
};
