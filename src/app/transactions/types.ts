import { ConsolidatedTransaction } from "../../../stmt-parser/src/types";

export type TransactionInfo = {
  id: number;
  hash: string;
  category?: string;
} & ConsolidatedTransaction;

export type Operation = "contains";

export type CategorisationRuleOp = {
  id: number;
  op: Operation;
  value: string;
  targetField: Omit<keyof TransactionInfo, "category" | "id">;
};

export type CategorisationRule = {
  id: number;
  operations: CategorisationRuleOp[];
  category: string;
};

export type TransactionsProfile = {
  transactions: TransactionInfo[];
  transactionMap: Record<number, TransactionInfo>;
  categorisationRules: CategorisationRule[];
  categories: string[];
};
