"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CategorisationRule } from "../types";
import { DeleteRuleButton } from "./delete-rule-button";

export const ruleColumns: ColumnDef<CategorisationRule>[] = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "operations",
    header: "Operations",
    cell: ({ row }) => {
      const { operations } = row.original;
      const result: string[] = [];
      for (let i = 0; i < operations.length; ++i) {
        const op = operations[i];
        result.push(op.targetField as string);
        result.push(op.op);
        result.push(op.value);
        if (i !== operations.length - 1) {
          result.push("AND");
        }
      }
      return result.join(" ");
    },
  },
  {
    header: "Action",
    id: "action",
    cell: ({ row }) => {
      return <DeleteRuleButton rule={row.original} />;
    },
  },
];
