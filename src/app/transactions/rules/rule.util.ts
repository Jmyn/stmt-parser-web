import { CategorisationRule, TransactionInfo } from "../types";

export function processRule(
  trx: TransactionInfo,
  rule: CategorisationRule
): boolean {
  let isCategory = true;
  const { operations } = rule;
  for (const operation of operations) {
    const { op, value, targetField } = operation;
    switch (op) {
      case "contains": {
        isCategory =
          isCategory &&
          (trx[targetField as keyof TransactionInfo]
            ?.toString()
            .includes(value) ??
            false);
        break;
      }
      default: {
        isCategory = false;
        break;
      }
    }
  }
  return isCategory;
}
