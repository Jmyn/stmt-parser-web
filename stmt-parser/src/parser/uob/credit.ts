import { assert } from "@std/assert/assert";
import type {
  CreditAccountStatement,
  CreditStatement,
  Statement,
} from "../../types.ts";
import { convertddMMMToDate } from "../../util.ts";
import type { StatementParser } from "../types.ts";
import { pdfText } from "jsr:@pdf/pdftext/pdftext";

export class UobCreditParser implements StatementParser {
  public async parse(buffer: ArrayBuffer): Promise<Statement> {
    const statement = await pdfText(buffer);
    const statementText = statement[0];

    // Regex patterns to match key details
    const statementDatePattern = /^Statement Date (\d{2} .{3} \d{4})/m;
    // (accountNo) (accountHolderName) (transactionsText)
    const transactionsPattern =
      /^(\d+-\d+-\d+-?\d+) ([A-Za-z ]+)$([\w\S\s]*?)SUB TOTAL/gm;

    // <post_date>(dd MMM) <trans_date>(dd MMM) (description) (value) (inflow)?
    const transactionPattern =
      /(\d{2} \w{3})\s+(\d{2} \w{3})\s+([\s\S]+?)\s+([\d,]+\.\d{2})\s?(CR)?/gm;

    const dateMatch = statementText.match(statementDatePattern);
    assert(dateMatch);
    const [, ddMMMyyyy] = dateMatch;
    const statementStartDate = new Date(ddMMMyyyy);
    const statementYear = statementStartDate.getFullYear();

    const consolidatedStmt: CreditStatement = {
      accountStatements: [],
      statementSource: "uob",
      statementType: "credit",
      statementStartDate,
    };

    let account: Partial<CreditAccountStatement> = { transactions: [] };

    const transactionsMatches = statementText.matchAll(transactionsPattern);

    for (const transactionMatch of transactionsMatches) {
      const [, accountNo, accountHolderName, transactionsText] =
        transactionMatch;
      const transactions = transactionsText.matchAll(transactionPattern);

      account.accountHolderName = accountHolderName;
      account.accountNo = accountNo;
      account.transactions = [];
      for (const transactionMatch of transactions) {
        const [, , trxDateStr, description, trxAmtStr, inflowStr] =
          transactionMatch;
        const isInflow = !!inflowStr;

        // statement did not specify transaction year.
        // assume that transaction date cannot exceed statement date, else assume transaction occur in previous year
        const transactionDate1 = convertddMMMToDate(
          trxDateStr,
          statementYear,
        );
        const transactionDate2 = convertddMMMToDate(
          trxDateStr,
          statementYear - 1,
        );
        assert(transactionDate1);
        assert(transactionDate2);
        const transactionDate = transactionDate1 > statementStartDate
          ? transactionDate2
          : transactionDate1;

        account.transactions?.push({
          transactionDate,
          transactionValue: parseFloat(trxAmtStr.replaceAll(/[, ]/g, "")) *
            (isInflow ? 1 : -1),
          description,
        });
      }
      consolidatedStmt.accountStatements.push(
        account as CreditAccountStatement,
      );
      account = { transactions: [] };
    }
    return consolidatedStmt;
  }
}
