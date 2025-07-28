"use client";

import { ProfileContext } from "@/app/context/profile.context";
import { BarChart } from "@mui/x-charts";
import { useContext, useState } from "react";
import { formatDateMMMyyyy } from "./util";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface StackBarChartProps {
  readonly dataset: Record<string, number | string>[];
  readonly categories: string[];
}

function StackBarChart({ dataset, categories }: StackBarChartProps) {
  return (
    <BarChart
      dataset={dataset}
      xAxis={[{ scaleType: "band", dataKey: "date" }]}
      series={categories.map((c) => {
        return {
          dataKey: c,
          label: c,
          stack: "category",
          stackOrder: "descending",
        };
      })}
      width={1200}
      height={1200}
    />
  );
}

export default function StatsPage() {
  const { profile } = useContext(ProfileContext);
  const [categoryVisibility, setCategoryVisibility] = useState(
    profile.categories.reduce((acc, curr) => {
      acc[curr] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );
  const dateToCategoryToExpense: Record<string, Record<string, number>> = {};

  for (const transaction of profile.transactions) {
    const date = formatDateMMMyyyy(transaction.transactionDate);
    if (!dateToCategoryToExpense[date]) {
      dateToCategoryToExpense[date] = {};
    }
    if (!transaction.category) {
      continue;
    }
    if (!dateToCategoryToExpense[date][transaction.category]) {
      dateToCategoryToExpense[date][transaction.category] = 0;
    }
    dateToCategoryToExpense[date][transaction.category] +=
      transaction.transactionValue;
    dateToCategoryToExpense[date][transaction.category] =
      Math.round(dateToCategoryToExpense[date][transaction.category] * 100) /
      100;
  }

  const dataset: Record<string, number | string>[] = [];
  for (const date of Object.keys(dateToCategoryToExpense)) {
    const data: Record<string, number | string> = {};
    data["date"] = date;
    for (const [category, val] of Object.entries(
      dateToCategoryToExpense[date]
    )) {
      data[category] = val;
    }
    dataset.push(data);
  }

  const monthlyAvg =
    dataset
      .map((d) => {
        return Object.entries(d).reduce((acc, [k, v]) => {
          if (typeof v === "string") {
            return acc;
          }
          if (!categoryVisibility[k]) {
            return acc;
          }
          return acc + v;
        }, 0);
      })
      .reduce((acc, curr) => acc + curr, 0) / dataset.length;

  return (
    <>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Categories <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(categoryVisibility).map(([categoryName, v]) => {
              return (
                <DropdownMenuCheckboxItem
                  key={categoryName}
                  className="capitalize"
                  checked={v}
                  onCheckedChange={(value) => {
                    categoryVisibility[categoryName] = value;
                    setCategoryVisibility({ ...categoryVisibility });
                  }}
                >
                  {categoryName}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <StackBarChart
          dataset={dataset}
          categories={Object.entries(categoryVisibility)
            .filter(([, v]) => v)
            .map(([c]) => c)}
        />
      </div>
      <div>
        <span>
          Average monthly expense for selected categories:{" "}
          {monthlyAvg.toFixed(2)}
        </span>
      </div>
    </>
  );
}
