import { assert } from "@std/assert/assert";
import { ParserRecord } from "./parser/index.ts";
import * as path from "jsr:@std/path";
import * as fs from "https://deno.land/std@0.224.0/fs/mod.ts";
import type {
  ConsolidatedTransaction,
  ConsolidatedTransactionSummary,
  Statement,
  StatementSource,
  StatementType,
} from "./types.ts";
import { VALID_STATEMENT_SOURCE, VALID_STATEMENT_TYPE } from "./const.ts";

const INPUT_DIR = Deno.env.get("INPUT_DIR") ?? "./statements";
const OUTPUT_DIR = Deno.env.get("OUTPUT_DIR") ?? "./outputs";
const IGNORE_CSV = Deno.env.get("IGNORE_CSV") ?? ".DS_Store";

function shouldIgnore(entry: fs.WalkEntry): boolean {
  const { name } = entry;
  const ignoreArr = IGNORE_CSV.split(",");
  return ignoreArr.includes(name);
}

function parseStatementPath(dirpath: string) {
  const dirpathSplit = dirpath.split(path.SEPARATOR);

  const statementType = dirpathSplit[dirpathSplit.length - 1] as StatementType;
  const statementSrc = dirpathSplit[dirpathSplit.length - 2] as StatementSource;
  assert(VALID_STATEMENT_TYPE.includes(statementType));
  assert(VALID_STATEMENT_SOURCE.includes(statementSrc));
  return [statementSrc, statementType] as const;
}

function mapTransactions(stmt: Statement): ConsolidatedTransaction[] {
  const trxs: ConsolidatedTransaction[] = [];
  for (const accStmt of stmt.accountStatements) {
    trxs.push(...accStmt.transactions.map((t) =>
      ({
        transactionDate: t.transactionDate,
        transactionValue: t.transactionValue,
        description: t.description,
        source: stmt.statementSource,
        sourceAccountNo: accStmt.accountNo,
      }) as ConsolidatedTransaction
    ));
  }
  return trxs;
}

async function main() {
  const transactions: ConsolidatedTransaction[] = [];

  fs.ensureDirSync(OUTPUT_DIR);
  const walk = fs.walkSync(INPUT_DIR);
  for (const entry of walk) {
    if (entry.isFile) {
      if (shouldIgnore(entry)) {
        continue;
      }
      const { dir, name } = path.parse(entry.path);
      const [statementSrc, statementType] = parseStatementPath(dir);

      const parser = ParserRecord[statementSrc][statementType];
      assert(parser);

      const file = Deno.readFileSync(
        path.join(entry.path),
      );
      const stmt = await parser.parse(file);
      transactions.push(...mapTransactions(stmt));

      const outputFilePath = path.join(
        OUTPUT_DIR,
        statementSrc,
        statementType,
        name + ".json",
      );
      fs.ensureFileSync(outputFilePath);
      Deno.writeTextFileSync(
        outputFilePath,
        JSON.stringify(stmt, null, 2),
      );
    }
  }
  transactions.sort((a, b) => a.transactionDate < b.transactionDate ? -1 : 1);
  const summary: ConsolidatedTransactionSummary = {
    transactions,
  };
  Deno.writeTextFileSync(
    path.join(OUTPUT_DIR, "transactions.json"),
    JSON.stringify(summary, null, 2),
  );
}

main();
