import type { VALID_STATEMENT_SOURCE, VALID_STATEMENT_TYPE } from "./const.ts";

export type StatementSource = typeof VALID_STATEMENT_SOURCE[number];

export type StatementType = typeof VALID_STATEMENT_TYPE[number];

export type DebitTransaction = {
  balance?: number;
  valueDate?: Date;
} & Transaction;

export type Transaction = {
  transactionDate: Date;
  /**
   * Negative/Positive number represents out/in flow
   */
  transactionValue: number;
  description: string;
};

export type ConsolidatedTransaction = {
  source: StatementSource;
  sourceAccountNo: string;
} & Transaction;

export type ConsolidatedTransactionSummary = {
  transactions: ConsolidatedTransaction[];
};

export type StatementBase = {
  statementType: StatementType;
  statementSource: StatementSource;
  statementStartDate: Date;
  statementEndDate?: Date;
};

export type DebitStatement = StatementBase & {
  statementType: "debit";
  accountStatements: DebitAccountStatement[];
};

export type DebitAccountStatement = {
  initialBalance?: number;
  accountNo?: string;
  transactions: DebitTransaction[];
};

export type CreditStatement = StatementBase & {
  statementType: "credit";
  accountStatements: CreditAccountStatement[];
};

export type CreditAccountStatement = {
  accountHolderName: string;
  accountNo: string;
  transactions: Transaction[];
};

export type Statement = DebitStatement | CreditStatement;
