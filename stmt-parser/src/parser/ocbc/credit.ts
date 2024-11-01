import { assert } from "@std/assert/assert";
import type {
  CreditAccountStatement,
  CreditStatement,
  Statement,
} from "../../types.ts";
import { parseDateString } from "../../util.ts";
import type { StatementParser } from "../types.ts";
import { pdfText } from "jsr:@pdf/pdftext/pdftext";

export class OcbcCreditParser implements StatementParser {
  public async parse(buffer: ArrayBuffer): Promise<Statement> {
    const statement = await pdfText(buffer);
    const statementText = statement[0];
    const statementLines = statementText.split("\n");
    // Regex patterns to match key details
    const statementDatePattern =
      /^(\d{2} - \d{2} - \d{4}) (\d{2} - \d{2} - \d{4})/m;
    const transactionPattern =
      /^(\d{2} \/ \d{2}) (\(? ?)([\d,. ]+ . \d{2}) (.+)/m;

    const startAccountTrxPattern = /^(.+) (\d+-\d+-\d+-\d+)/m;
    const endAccountTrxPattern = /^(\d+ . \d{2}) SUBTOTAL/gm;

    const dateMatch = statementText.match(statementDatePattern);
    const statementStartDate = parseDateString(
      dateMatch ? dateMatch[1] : "",
      " - ",
    );
    assert(statementStartDate);
    const statementYear = statementStartDate.getFullYear();

    const consolidatedStmt: CreditStatement = {
      accountStatements: [],
      statementSource: "ocbc",
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
        let [, trxDateStr, inflowBracket, trxAmtStr, description] = trxMatch;
        const isInflow = inflowBracket !== "";
        // Collect additional lines as part of the description (up to 4 lines)
        let extraDescriptionLines = 0;
        while (
          i + 1 < statementLines.length &&
          extraDescriptionLines < 4 &&
          !statementLines[i + 1].trim().match(transactionPattern) &&
          !statementLines[i + 1].trim().match(endAccountTrxPattern)
        ) {
          i++;
          description += " " + statementLines[i].trim();
          extraDescriptionLines++;
        }

        // ocbc statement did not specify transaction year.
        // assume that transaction date cannot exceed statement date, else assume transaction occur in previous year
        const transactionDate1 = parseDateString(
          trxDateStr,
          " / ",
          statementYear,
        );
        const transactionDate2 = parseDateString(
          trxDateStr,
          " / ",
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
