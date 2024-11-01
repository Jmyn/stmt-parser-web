import { parse, stringify } from "jsr:@std/csv";

import type { DebitStatement, Statement } from "../../types.ts";
import type { StatementParser } from "../types.ts";
import type { DebitTransaction } from "../../types.ts";
import type { DebitAccountStatement } from "../../types.ts";

type CdcDebitTransation = {
  "Timestamp (UTC)": string;
  "Transaction Description": string;
  Currency: string;
  Amount: string;
  "To Currency": string;
  "To Amount": string;
  "Native Currency": string;
  "Native Amount": string;
  "Native Amount (in USD)": string;
  "Transaction Kind": string;
  "Transaction Hash": string;
};

export class CdcDebitParser implements StatementParser {
  public async parse(buffer: ArrayBuffer): Promise<Statement> {
    const decoder = new TextDecoder();
    const text = decoder.decode(buffer);
    const transactionsRaw = parse(text, {
      skipFirstRow: true,
      strip: true,
    }) as CdcDebitTransation[];

    const consolidatedStmt: DebitStatement = {
      accountStatements: [],
      statementSource: "cdc",
      statementType: "debit",
      statementStartDate: new Date(),
    };

    const accStmt: DebitAccountStatement = {
      transactions: [],
    };

    for (const trx of transactionsRaw) {
      const transaction: DebitTransaction = {
        transactionDate: new Date(trx["Timestamp (UTC)"]),
        transactionValue: parseFloat(trx["Native Amount"]),
        description: trx["Transaction Description"],
      };
      accStmt.transactions.push(transaction);
    }

    consolidatedStmt.accountStatements.push(accStmt);

    return consolidatedStmt;
  }
}
