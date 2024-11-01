import { pdfText } from "jsr:@pdf/pdftext/pdftext";
import type {
  DebitStatement,
  DebitTransaction,
  Statement,
} from "../../types.ts";
import { convertddMMMToDate, determineTrxDateYear } from "../../util.ts";
import type { StatementParser } from "../types.ts";

export class OcbcDebitParser implements StatementParser {
  public async parse(buffer: ArrayBuffer): Promise<Statement> {
    const statementText = (await pdfText(buffer))[0];
    // Regex for initial balance brought forward
    const balanceRegex = /([\d,]+\.\d{2}) BALANCE B\/F/;
    const startDateRegex =
      /Account No\.\s+(\d+)\s+(\d{1,2} \w{3}) \d{4}\s+TO\s+(\d{1,2} \w{3}) (\d{4})/;

    const balanceMatch = statementText.match(balanceRegex);
    const dateMatch = statementText.match(startDateRegex);

    const initialBalance = balanceMatch
      ? parseFloat(balanceMatch[1].replace(/,/g, ""))
      : 0;
    const accountNo = dateMatch ? dateMatch[1] : "";
    const statementStart = dateMatch ? dateMatch[2] : "";
    const statementEnd = dateMatch ? dateMatch[3] : "";
    const statementYear = dateMatch ? parseInt(dateMatch[4]) : -1;

    const statementStartDate = convertddMMMToDate(
      statementStart,
      statementYear,
    );
    const statementEndDate = convertddMMMToDate(statementEnd, statementYear);

    const transactions = this.extractTransactions(
      statementText,
      statementYear,
      initialBalance,
      statementEndDate,
    );
    const statement: DebitStatement = {
      statementSource: "ocbc",
      statementType: "debit",
      accountStatements: [{
        accountNo,
        initialBalance,
        transactions,
      }],
      statementStartDate,
      statementEndDate,
    };

    return statement;
  }

  private extractTransactions(
    statementText: string,
    statementYear: number,
    initialBalance: number,
    statementEndDate: Date,
  ): DebitTransaction[] {
    const transactions: DebitTransaction[] = [];
    let balance = initialBalance;
    const statementLines = statementText.split("\n");

    const transactionRegex =
      /^(\d{2} \w{3})\s+([\d,.]+)\s+([\d,.]+)\s+(\d{2} \w{3})\s+(.+)/;
    let currentTransaction: Partial<DebitTransaction> | null = null;
    const footerRegex = /,Deposit Insurance Scheme/;

    for (let i = 0; i < statementLines.length; i++) {
      const line = statementLines[i].trim();
      const match = line.match(transactionRegex);

      if (!match) {
        continue;
      }
      if (currentTransaction) {
        // Push the previous transaction if it exists
        transactions.push(currentTransaction as DebitTransaction);
      }
      const newBalance = parseFloat(match[3].replace(/,/g, ""));
      const isDeposit = balance < newBalance;
      balance = newBalance;

      const hasFooter = line.match(footerRegex) !== null;

      // ocbc statement did not specify transaction year.
      const transactionDate = convertddMMMToDate(match[1], statementYear);
      const trxYr = determineTrxDateYear(
        transactionDate,
        statementEndDate,
      );
      transactionDate.setFullYear(trxYr);

      // Create a new transaction entry
      currentTransaction = {
        transactionDate,
        transactionValue: parseFloat(match[2].replace(/,/g, "")) *
          (isDeposit ? 1 : -1),
        balance: parseFloat(match[3].replace(/,/g, "")),
        valueDate: convertddMMMToDate(match[4], statementYear),
        description: hasFooter
          ? match[5].trim().replace(footerRegex, "")
          : match[5].trim(),
      };

      if (hasFooter) {
        continue;
      }

      // Collect additional lines as part of the description (up to 4 lines)
      let extraDescriptionLines = 0;
      while (
        i + 1 < statementLines.length &&
        extraDescriptionLines < 4 &&
        !statementLines[i + 1].match(transactionRegex)
      ) {
        i++;
        if (statementLines[i].match(footerRegex)) {
          currentTransaction.description += " " +
            statementLines[i].trim().replace(footerRegex, "");
          break;
        }
        currentTransaction.description += " " + statementLines[i].trim();
        extraDescriptionLines++;
      }
    }

    // Push the last transaction if exists
    if (currentTransaction) {
      transactions.push(currentTransaction as DebitTransaction);
    }

    return transactions;
  }
}
