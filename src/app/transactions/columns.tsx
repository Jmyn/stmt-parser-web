"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ConsolidatedTransaction } from "../../../stmt-parser/src/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export const columns: ColumnDef<ConsolidatedTransaction>[] = [
  {
    accessorKey: "source",
    header: "Source",
  },
  {
    accessorKey: "sourceAccountNo",
    header: "AccountNo",
  },
  {
    accessorKey: "transactionDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Trans Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(
        row.getValue<Date>("transactionDate")
      ).toLocaleDateString();
      return (
        <div className="text-right font-medium" suppressHydrationWarning>
          {date}
        </div>
      );
    },
  },
  {
    accessorKey: "transactionValue",
    header: () => <div className="text-right">Trans Value</div>,
  },
  {
    accessorKey: "description",
    header: "Description",
  },
];
