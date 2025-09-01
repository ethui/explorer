import { Card } from "@ethui/ui/components/shadcn/card";
import { Table } from "@ethui/ui/components/table";
import { createColumnHelper } from "@tanstack/react-table";
import titleize from "titleize";
import type { Transaction } from "viem";
import { decodeFunctionData } from "viem";
import { AddressLink } from "#/components/AddressLink";
import { LinkText } from "#/components/LinkText";
import useAbi from "#/hooks/useAbi";
import { formatEth } from "#/utils/formatters";
import { truncateHex } from "#/utils/hash";
import { getMethodName } from "#/utils/transaction";

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
      <AddressLink
        address={row.original.from}
        text={truncateHex(row.original.from, 6)}
      />
    ),
  }),
  columnHelper.accessor("to", {
    header: "To",
    cell: ({ row }) =>
      row.original.to && (
        <AddressLink
          address={row.original.to}
          text={truncateHex(row.original.to, 6)}
        />
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
    <Card className="rounded-lg border bg-card p-6 shadow-sm">
      <span className="p-2 pb-4 text-sm">
        A total of {transactions.length} transactions found
      </span>
      <Table rowClassName="h-16" data={transactions} columns={columns} />
    </Card>
  );
}
