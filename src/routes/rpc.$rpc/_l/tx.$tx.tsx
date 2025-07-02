import { createFileRoute } from "@tanstack/react-router";
import { type Hash, isHash } from "viem";
import { useTransaction, useTransactionReceipt } from "wagmi";
import PageContainer from "#/components/PageContainer";
import { Card } from "@ethui/ui/components/shadcn/card";
import { LoadingSpinner } from "#/components/LoadingSpinner";

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
      <TransactionDetails tx={tx} />
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

  return (
    <Card className="p-8 flex flex-col rounded-2xl border shadow-md mt-4">
      {isTransactionLoading || isReceiptLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <TransactionLabelValue
            label="Transaction Hash"
            value={transaction?.hash}
          />
          {receipt && (
            <TransactionLabelValue
              label="Status"
              value={receipt.status === "success" ? "Success" : "Failed"}
            />
          )}
        </>
      )}
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
      <div className="flex flex-row items-start pb-6">
        <div className="text-sm text-muted-foreground w-1/4 pr-4 flex-shrink-0">
          {label}
        </div>
        <div className="text-sm flex-1 break-all">{value}</div>
      </div>
    );
  }
}
