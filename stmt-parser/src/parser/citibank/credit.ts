import { assert } from "@std/assert/assert";
import type {
  CreditAccountStatement,
  CreditStatement,
  Statement,
} from "../../types.ts";
import { convertddMMMToDate } from "../../util.ts";
import type { StatementParser } from "../types.ts";
import { pdfText } from "jsr:@pdf/pdftext/pdftext";

export class CitibankCreditParser implements StatementParser {
  public async parse(buffer: ArrayBuffer): Promise<Statement> {
    const statement = await pdfText(buffer);
    const statementText = statement[0];
    const statementLines = statementText.split("\n");

    // Regex patterns to match key details
    // (month) (day) , (year)
    const statementDatePattern =
      /^S t a t e m e n t D a t e (.+)([\d\s]{3}) , ([\d\s]{7})/m;
    // (dd) (MMM) (description) (inflow)? (value)
    const transactionPattern =
      /^([\d\s]{3}) (.{5}) (.+) S G (\(? ?)([\d\s]+ . [\d\s]{3})/m;
    const startAccountTrxPattern = /^.+ ([\d\s]{31}) - (.+)/m;
    const endAccountTrxPattern = /^G R A N D T O T A L/gm;

    const dateMatch = statementText.match(statementDatePattern);
    assert(dateMatch);
    const [, mth, day, year] = dateMatch;
    const trxDateStr = [
      mth.replaceAll(" ", ""),
      day.replaceAll(" ", ""),
      year.replaceAll(" ", ""),
    ].join(" ");
    const statementStartDate = new Date(trxDateStr);
    const statementYear = statementStartDate.getFullYear();

    const consolidatedStmt: CreditStatement = {
      accountStatements: [],
      statementSource: "citibank",
      statementType: "credit",
      statementStartDate,
    };

    let isAccountStart = false;
    let account: Partial<CreditAccountStatement> = { transactions: [] };
    for (let i = 0; i < statementLines.length; i++) {
      const line = statementLines[i].trim();
      const accountStartMatch = line.match(startAccountTrxPattern);
      const accountEndMatch = line.match(endAccountTrxPattern);
      const trxMatch = line.match(transactionPattern);

      if (accountStartMatch && !isAccountStart) {
        account.accountHolderName = accountStartMatch[1];
        account.accountNo = accountStartMatch[2];
        account.transactions = [];
        isAccountStart = true;
        continue;
      }
      if (accountEndMatch && isAccountStart) {
        consolidatedStmt.accountStatements.push(
          account as CreditAccountStatement,
        );
        account = { transactions: [] };
        isAccountStart = false;
        continue;
      }
      if (trxMatch) {
        const [, trxDayStr, trxMthStr, description, inflowBracket, trxAmtStr] =
          trxMatch;
        const isInflow = inflowBracket !== "";

        // statement did not specify transaction year.
        // assume that transaction date cannot exceed statement date, else assume transaction occur in previous year
        const transactionDate1 = convertddMMMToDate(
          trxDayStr.replaceAll(" ", "") + " " + trxMthStr.replaceAll(" ", ""),
          statementYear,
        );
        const transactionDate2 = convertddMMMToDate(
          trxDayStr.replaceAll(" ", "") + " " + trxMthStr.replaceAll(" ", ""),
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
        continue;
      }
    }

    return consolidatedStmt;
  }
}
