import {
  ConsolidatedTransaction,
  ConsolidatedTransactionSummary,
} from "../../../stmt-parser/src/types";
import data from "./mock-transactions.json";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const trxSummary = data as unknown as ConsolidatedTransactionSummary;

async function getData(): Promise<ConsolidatedTransaction[]> {
  // Fetch data from your API here.
  return trxSummary.transactions;
}

export default async function TransactionsPage() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
