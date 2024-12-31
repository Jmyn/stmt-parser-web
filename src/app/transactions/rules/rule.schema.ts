"use client";

import { z } from "zod";
import { Operation, TransactionInfo } from "../types";

const categorisationRuleOpSchema = z.object({
  id: z.number(),
  op: z.literal("contains"),
  value: z.string(),
  targetField: z.string(),
});

export const categorisationRuleSchema = z.object({
  id: z.number(),
  operations: z.array(categorisationRuleOpSchema),
  category: z.string(),
});

export const operationSelections: { label: Operation; value: Operation }[] = [
  { label: "contains", value: "contains" },
];
export const targetFieldSelections: {
  label: keyof TransactionInfo;
  value: keyof TransactionInfo;
}[] = [
  { label: "description", value: "description" },
  { label: "source", value: "source" },
  { label: "sourceAccountNo", value: "sourceAccountNo" },
  { label: "hash", value: "hash" },
];
