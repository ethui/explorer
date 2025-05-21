import { createColumnHelper } from "@tanstack/react-table";
import Big from "big.js";
import { type Transaction, formatEther } from "viem";
import { LinkText } from "#/components/LinkText";
import Table from "#/components/Tables/Table";
import { truncateHex } from "#/utils/hash";

interface TransactionsTableProps {
  transactions: Transaction[];
}

const columnHelper = createColumnHelper<Transaction>();

const columns = [
  columnHelper.accessor("hash", {
    header: "Transaction hash",
    cell: ({ row }) => (
      <LinkText
        to="/rpc/$rpc/transaction/$hash"
        params={{ hash: row.original.hash }}
        tooltip={row.original.hash}
      >
        {truncateHex(row.original.hash, 11, false)}
      </LinkText>
    ),
  }),
  columnHelper.accessor("blockNumber", {
    header: "Block",
    cell: ({ row }) => (
      <LinkText
        to="/rpc/$rpc/block/$blockNumber"
        params={{
          blockNumber: row.original.blockNumber?.toString() ?? "",
        }}
      >
        {row.original.blockNumber}
      </LinkText>
    ),
  }),
  columnHelper.accessor("from", {
    header: "From",
    cell: ({ row }) => (
      <LinkText
        to="/rpc/$rpc/address/$address"
        params={{ address: row.original.from }}
        tooltip={row.original.from}
      >
        {truncateHex(row.original.from, 8)}
      </LinkText>
    ),
  }),
  columnHelper.accessor("to", {
    header: "To",
    cell: ({ row }) =>
      row.original.to && (
        <LinkText
          to="/rpc/$rpc/address/$address"
          params={{ address: row.original.to }}
          tooltip={row.original.to}
        >
          {truncateHex(row.original.to, 8)}
        </LinkText>
      ),
  }),
  columnHelper.accessor("value", {
    header: "Amount",
    cell: ({ row }) => (
      <span>
        {Big(formatEther(row.original.value)).round(9).toString()} ETH
      </span>
    ),
  }),
  columnHelper.display({
    id: "fee",
    header: "Txn Fee",
    cell: ({ row }) => {
      const { gas, gasPrice } = row.original;
      if (!gasPrice) return null;

      const fee = gas * gasPrice;

      return (
        <span className="text-muted-foreground text-xs">
          {Big(formatEther(fee)).round(8).toString()}
        </span>
      );
    },
  }),
];

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-md">
      <span className="p-2 pb-4 text-sm">
        A total of {transactions.length} transactions found
      </span>
      <Table data={transactions} columns={columns} />
    </div>
  );
}
