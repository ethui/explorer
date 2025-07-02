import { createFileRoute } from "@tanstack/react-router";
import { type Hash, isHash, Transaction, TransactionReceipt } from "viem";
import { useTransaction, useTransactionReceipt } from "wagmi";
import PageContainer from "#/components/PageContainer";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Card,
} from "@ethui/ui/components/shadcn/card";

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
  const { data: transaction } = useTransaction({
    hash: tx,
  });
  const { data: receipt } = useTransactionReceipt({
    hash: tx,
  });

  return (
    <PageContainer header="Transaction Details">
      <TransactionDetails
        transaction={transaction as Transaction}
        receipt={receipt}
      />
    </PageContainer>
  );
}

function TransactionDetails({
  transaction,
  receipt,
}: {
  transaction: Transaction;
  receipt?: TransactionReceipt;
}) {
  return (
    <Card className="p-8 flex flex-col rounded-2xl border shadow-md mt-4">
      <TransactionLabelValue
        label="Transaction Hash"
        value={transaction.hash}
      />
      {receipt && (
        <TransactionLabelValue
          label="Status"
          value={receipt.status === "success" ? "Success" : "Failed"}
        />
      )}
    </Card>
  );
}

function TransactionLabelValue({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) {
  return (
    <div className="flex flex-row items-center pb-6">
      <div className="text-sm text-muted-foreground w-1/4">{label}</div>
      <div className="text-sm w-3/4">{value}</div>
    </div>
  );
}
