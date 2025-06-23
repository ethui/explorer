import { createColumnHelper } from "@tanstack/react-table";
import type { Transaction } from "viem";
import { LinkText } from "#/components/LinkText";
import { formatEth } from "#/utils/formatters";
import { truncateHex } from "#/utils/hash";
import Table from "./Table";

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
    cell: ({ row }) => {
      const blockNumber = BigInt(
        row.original.blockNumber?.toString() ?? "0",
      ).toString();
      return (
        <LinkText
          to="/rpc/$rpc/block/$blockNumber"
          params={{
            blockNumber,
          }}
        >
          {blockNumber}
        </LinkText>
      );
    },
  }),
  columnHelper.accessor("from", {
    header: "From",
    cell: ({ row }) => (
      <LinkText
        to="/rpc/$rpc/address/$address"
        params={{ address: row.original.from }}
        tooltip={row.original.from}
      >
        {truncateHex(row.original.from)}
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
          {truncateHex(row.original.to)}
        </LinkText>
      ),
  }),
  columnHelper.accessor("value", {
    header: "Amount",
    cell: ({ row }) => <span>{formatEth(row.original.value, 9)} ETH</span>,
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
          {formatEth(fee)} ETH
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
