"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { TransactionInfo } from "./types";
import { EditSheet } from "./edit-sheet";

export const columns: ColumnDef<TransactionInfo>[] = [
  {
    accessorKey: "hash",
    header: "Hash",
  },
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
        <div className="text-left font-medium" suppressHydrationWarning>
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
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    header: "Action",
    id: "action",
    cell: ({ row }) => {
      const t = row.original;
      return <EditSheet transaction={t} />;
    },
  },
];
