"use client";

import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { ConsolidatedTransactionSummary } from "../../../stmt-parser/src/types";
import { ProfileContext } from "../context/profile.context";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { processRule } from "./rules/rule.util";
import { TransactionInfo } from "./types";
import { generateUUID } from "./util";

export default function TransactionsPage() {
  const { profile, saveProfile, setProfile } = useContext(ProfileContext);

  const onUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const file = formData.get("file") as File;

    if (file) {
      const reader = new FileReader();

      // Callback when file is read
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const summary = JSON.parse(
            reader.result
          ) as ConsolidatedTransactionSummary;
          profile.transactions = summary.transactions.map((t, i) => ({
            id: i,
            hash: generateUUID(
              t.source,
              t.sourceAccountNo,
              t.transactionDate.toString(),
              t.transactionValue.toString(),
              t.description
            ),
            ...t,
            transactionDate: new Date(t.transactionDate),
          }));
          profile.transactionMap = profile.transactions.reduce((prev, curr) => {
            prev[curr.id] = curr;
            return prev;
          }, {} as Record<number, TransactionInfo>);

          const categories = new Set<string>();

          const hashRules = profile.categorisationRules.filter((r) =>
            r.operations.some((o) => o.targetField === "hash")
          );
          for (const rule of profile.categorisationRules) {
            categories.add(rule.category);
            for (const trx of profile.transactions) {
              if (processRule(trx, rule)) {
                trx.category = rule.category;
              }
            }
          }
          // process hash rules last
          for (const rule of hashRules) {
            categories.add(rule.category);
            for (const trx of profile.transactions) {
              if (processRule(trx, rule)) {
                trx.category = rule.category;
              }
            }
          }
          const newProfile = {
            ...profile,
            categories: Array.from(categories),
            transactions: [...profile.transactions],
          };
          setProfile(newProfile);
          saveProfile(newProfile);
        }
      };

      // Read file as text
      reader.readAsText(file);
    } else {
      console.error("No file selected.");
    }
  };
  return (
    <div className="container mx-auto py-10">
      <form onSubmit={onUpload} encType="multipart/form-data">
        <input type="file" name="file" required />
        <Button type="submit">upload</Button>
      </form>
      <DataTable columns={columns} data={profile.transactions} />
    </div>
  );
}
