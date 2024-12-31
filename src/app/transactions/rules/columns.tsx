"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CategorisationRule } from "../types";
import { Button } from "@/components/ui/button";
import { Icon, MinusIcon } from "lucide-react";
import { useContext } from "react";
import { ProfileContext } from "@/app/context/profile.context";

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
      const { id } = row.original;
      const { profile, setProfile, saveProfile } = useContext(ProfileContext);
      return (
        <Button
          onClick={() => {
            profile.categorisationRules.splice(id, 1);
            const newProfile = {
              ...profile,
              categorisationRules: [...profile.categorisationRules],
            };
            setProfile(newProfile);
            saveProfile(newProfile);
          }}
        >
          <MinusIcon></MinusIcon>
        </Button>
      );
    },
  },
];
