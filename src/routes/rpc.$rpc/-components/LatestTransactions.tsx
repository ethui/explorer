import { ReceiptText } from "lucide-react";
import { useMemo } from "react";
import type { Transaction } from "viem";
import { LinkText } from "#/components/LinkText";
import { useLatestTransactions } from "#/hooks/useLatestTransactions";
import { truncateHex } from "#/utils/hash";
import { formatRelativeTime } from "#/utils/time";
import {
  AmountWrapper,
  EmptyCardContentList,
  LoadingCardContentList,
} from "./Card";

interface LatestTransactionsProps {
  latestBlock: bigint;
  numberOfTransactions: number;
}

export function LatestTransactions({
  latestBlock,
  numberOfTransactions,
}: LatestTransactionsProps) {
  const { data, isLoading } = useLatestTransactions({
    latestBlock,
    numberOfTransactions,
  });

  const numEmptyTransactions = Math.max(
    0,
    numberOfTransactions - (data?.length ?? 0),
  );

  if (isLoading) {
    return (
      <ul>
        <LoadingCardContentList numItems={numberOfTransactions} />
      </ul>
    );
  }

  return (
    <ul>
      {data?.map((tx, _) => (
        <TransactionRow
          key={`tx-${tx.transaction.hash}`}
          transaction={tx.transaction}
          timestamp={tx.timestamp}
        />
      ))}
      <EmptyCardContentList numItems={numEmptyTransactions} />
    </ul>
  );
}

export function TransactionRow({
  transaction,
  timestamp,
}: {
  transaction: Transaction;
  timestamp: bigint;
}) {
  const formattedTime = useMemo(
    () => formatRelativeTime(timestamp),
    [timestamp],
  );

  return (
    <li className="flex flex-row gap-4 border-b py-4 last:border-b-0 lg:h-[85px]">
      <div className="flex w-1/3 flex-row items-center gap-2">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-accent">
          <ReceiptText className="h-5 w-5" />
        </div>
        <div className="flex flex-col gap-1">
          <LinkText
            to="/rpc/$rpc/tx/$tx"
            params={{ tx: transaction.hash }}
            tooltip={transaction.hash}
          >
            {truncateHex(transaction.hash, 11, false)}
          </LinkText>
          <span className="text-muted-foreground text-xs">{formattedTime}</span>
        </div>
      </div>
      <div className="flex w-2/3 flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-row items-center gap-2 text-xs">
            From
            <LinkText
              to="/rpc/$rpc/address/$address"
              params={{ address: transaction.from }}
              tooltip={transaction.from}
            >
              {truncateHex(transaction.from)}
            </LinkText>
          </div>
          {transaction.to && (
            <div className="flex flex-row items-center gap-2 text-xs">
              To
              <LinkText
                to="/rpc/$rpc/address/$address"
                params={{ address: transaction.to }}
                tooltip={transaction.to}
              >
                {truncateHex(transaction.to)}
              </LinkText>
            </div>
          )}
        </div>
        <AmountWrapper value={transaction.value} title="Amount" />
      </div>
    </li>
  );
}
