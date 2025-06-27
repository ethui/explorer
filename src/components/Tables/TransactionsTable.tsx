import { createColumnHelper } from "@tanstack/react-table";
import titleize from "titleize";
import type { Transaction } from "viem";
import { decodeFunctionData } from "viem";
import { LinkText } from "#/components/LinkText";
import useAbi from "#/hooks/useAbi";
import { formatEth } from "#/utils/formatters";
import { truncateHex } from "#/utils/hash";
import Table from "./Table";
interface TransactionsTableProps {
  transactions: Transaction[];
}

const columnHelper = createColumnHelper<Transaction>();

function MethodCell({ transaction }: { transaction: Transaction }) {
  if (!transaction.to) {
    return <span className="text-muted-foreground text-xs">-</span>;
  }

  const { abi } = useAbi({ address: transaction.to });

  if (!transaction.to || !transaction.input || transaction.input === "0x") {
    return <span className="text-muted-foreground text-xs">-</span>;
  }

  try {
    const decoded = decodeFunctionData({
      abi: abi ?? [],
      data: transaction.input,
    });

    return (
      <div className="flex w-fit flex-row items-center gap-2 rounded-md border bg-muted p-2">
        <span className="font-mono text-xs" title={decoded.functionName}>
          {titleize(decoded.functionName)}
        </span>
      </div>
    );
  } catch {
    return <span className="text-muted-foreground text-xs">-</span>;
  }
}

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
    size: 50,
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
  columnHelper.accessor("input", {
    header: "Method",
    cell: ({ row }) => <MethodCell transaction={row.original} />,
  }),
  columnHelper.accessor("from", {
    header: "From",
    cell: ({ row }) => (
      <LinkText
        to="/rpc/$rpc/address/$address"
        params={{ address: row.original.from }}
        tooltip={row.original.from}
      >
        {truncateHex(row.original.from, 6)}
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
          {truncateHex(row.original.to, 6)}
        </LinkText>
      ),
  }),

  columnHelper.accessor("value", {
    header: "Amount",
    cell: ({ row }) => <span>{formatEth(row.original.value, 4)} ETH</span>,
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
