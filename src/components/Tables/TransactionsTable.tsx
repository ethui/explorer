import { createColumnHelper } from "@tanstack/react-table";
import titleize from "titleize";
import type { Transaction } from "viem";
import { decodeFunctionData } from "viem";
import { LinkText } from "#/components/LinkText";
import useAbi from "#/hooks/useAbi";
import { formatEth } from "#/utils/formatters";
import { truncateHex } from "#/utils/hash";
import { getMethodName } from "#/utils/transaction";
import Table from "./Table";
interface TransactionsTableProps {
  transactions: Transaction[];
}

const columnHelper = createColumnHelper<Transaction>();

function EmptyMethodPill() {
  return <span className="text-muted-foreground text-xs">-</span>;
}

function MethodPill({ name, title }: { name: string; title?: string }) {
  return (
    <div className="flex max-w-24 flex-row items-center justify-center gap-2 rounded-md border bg-muted p-2">
      <span className="truncate font-mono text-xs" title={title}>
        {name}
      </span>
    </div>
  );
}

function MethodCell({ transaction }: { transaction: Transaction }) {
  if (!transaction.to || !transaction.input) {
    return <EmptyMethodPill />;
  }
  const methodName = getMethodName(transaction.input);

  if (methodName) {
    return <MethodPill name={methodName} />;
  }

  const { abi } = useAbi({ address: transaction.to });

  try {
    const decoded = decodeFunctionData({
      abi: abi ?? [],
      data: transaction.input,
    });

    return (
      <MethodPill
        name={titleize(decoded.functionName)}
        title={decoded.functionName}
      />
    );
  } catch {
    return <EmptyMethodPill />;
  }
}

const columns = [
  columnHelper.accessor("hash", {
    header: "Transaction hash",
    cell: ({ row }) => (
      <LinkText
        to="/rpc/$rpc/tx/$tx"
        params={{ tx: row.original.hash }}
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
