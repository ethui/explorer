import { Card } from "@ethui/ui/components/shadcn/card";
import { createFileRoute } from "@tanstack/react-router";
import clsx from "clsx";
import { format } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";
import titleize from "titleize";
import { type Hash, formatEther, isHash } from "viem";
import { useBlock, useTransaction, useTransactionReceipt } from "wagmi";
import { LinkText } from "#/components/LinkText";
import { LoadingSpinner } from "#/components/LoadingSpinner";
import PageContainer from "#/components/PageContainer";
import { Tabs } from "#/components/Tabs";
import useAbi from "#/hooks/useAbi";
import { formatRelativeTime } from "#/utils/time";

import { AbiItemFormWithPreview } from "@ethui/ui/components/abi-form/abi-item-form-with-preview";
import { getDecodedFunctionInput } from "#/utils/transaction";

export const Route = createFileRoute("/rpc/$rpc/_l/tx/$tx")({
  component: RouteComponent,
  loader: ({ params }) => {
    if (!isHash(params.tx)) {
      throw new Error("The transaction hash is not valid");
    }
    return { tx: params.tx as Hash };
  },
});

function RouteComponent() {
  const { tx } = Route.useLoaderData();

  return (
    <PageContainer header="Transaction Details">
      <Tabs
        tabs={[
          { label: "Overview", component: <TransactionDetails tx={tx} /> },
          { label: "Input Data", component: <InputDetails tx={tx} /> },
        ]}
      />
    </PageContainer>
  );
}

function TransactionDetails({ tx }: { tx: Hash }) {
  const { data: transaction, isLoading: isTransactionLoading } = useTransaction(
    {
      hash: tx,
    },
  );

  const { data: receipt, isLoading: isReceiptLoading } = useTransactionReceipt({
    hash: tx,
  });

  const { data: block, isLoading: isBlockLoading } = useBlock({
    blockNumber: transaction?.blockNumber,
  });

  if (isTransactionLoading || isReceiptLoading || isBlockLoading) {
    return <LoadingSpinner />;
  }

  if (!transaction) {
    return <div>Transaction not found</div>;
  }

  return (
    <Card className="flex flex-col rounded-2xl border p-8 pb-2 shadow-md">
      <TransactionLabelValue
        label="Transaction Hash"
        value={transaction?.hash}
      />
      {receipt && (
        <TransactionLabelValue
          label="Status"
          value={<StatusChip status={receipt.status} />}
        />
      )}
      <TransactionLabelValue
        label="Block"
        value={
          <LinkText
            to="/rpc/$rpc/block/$blockNumber"
            params={{
              blockNumber: receipt?.blockNumber?.toString() ?? "0",
            }}
          >
            {receipt?.blockNumber?.toString()}
          </LinkText>
        }
      />
      {block && (
        <TransactionLabelValue
          label="Timestamp"
          value={<Timestamp timestamp={block.timestamp} />}
        />
      )}

      <TransactionLabelValue
        label="From"
        value={
          <LinkText
            to="/rpc/$rpc/address/$address"
            params={{ address: transaction?.from }}
            tooltip={transaction?.from}
          >
            {transaction?.from}
          </LinkText>
        }
      />

      {transaction?.to && (
        <TransactionLabelValue
          label="To"
          value={
            <LinkText
              to="/rpc/$rpc/address/$address"
              params={{ address: transaction.to }}
              tooltip={transaction.to}
            >
              {transaction.to}
            </LinkText>
          }
        />
      )}

      <TransactionLabelValue
        label="Value"
        value={<span>{formatEther(transaction?.value)} ETH</span>}
      />

      {receipt && (
        <TransactionLabelValue
          label="Transaction Fee"
          value={
            <span>
              {formatEther(receipt.gasUsed * receipt.effectiveGasPrice)} ETH
            </span>
          }
        />
      )}
      <TransactionLabelValue
        label="Gas Price"
        value={<span>{formatEther(transaction.gasPrice ?? 0n)} ETH</span>}
      />
    </Card>
  );

  function TransactionLabelValue({
    label,
    value,
  }: {
    label: string;
    value: string | React.ReactNode;
  }) {
    return (
      <div className="flex flex-row items-center pb-6">
        <div className="w-1/4 flex-shrink-0 pr-4 text-muted-foreground text-sm">
          {label}
        </div>
        <div className="flex-1 break-all text-sm">{value}</div>
      </div>
    );
  }
}

function InputDetails({ tx }: { tx: Hash }) {
  const { data: transaction, isLoading: isTransactionLoading } = useTransaction(
    {
      hash: tx,
    },
  );

  const { abi } = useAbi({ address: transaction?.to ?? "0x" });

  const decodedInput =
    abi && transaction?.input
      ? getDecodedFunctionInput({
          abi,
          input: transaction?.input,
        })
      : null;

  if (isTransactionLoading) {
    return <LoadingSpinner />;
  }

  if (!transaction) {
    return <div>Transaction not found</div>;
  }

  if (!decodedInput) {
    return <div>No input data found</div>;
  }

  return (
    <div>
      {decodedInput && (
        <AbiItemFormWithPreview
          sender={transaction.from}
          chainId={transaction.chainId}
          defaultCalldata={transaction.input}
          abiFunction={decodedInput.abiFunction}
          address={transaction.to ?? "0x"}
        />
      )}
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const statusSuccess = status === "success";
  return (
    <div
      className={clsx(
        "flex w-fit flex-shrink-0 flex-row items-center gap-1 rounded border-2 p-1 text-xs",
        statusSuccess
          ? "border-green-500 bg-green-100 text-success"
          : "border-red-500 bg-red-100 text-error",
      )}
    >
      {statusSuccess ? <CheckCircle size={10} /> : <XCircle size={10} />}
      {titleize(status)}
    </div>
  );
}

function Timestamp({ timestamp }: { timestamp: bigint }) {
  const date = new Date(Number(timestamp) * 1000);
  return (
    <div className="flex flex-row items-center gap-4">
      <span>{formatRelativeTime(timestamp)}</span>
      <span className="text-muted-foreground text-xs">
        ({format(date, "MMM-dd-yyyy HH:mm:ss")})
      </span>
    </div>
  );
}
