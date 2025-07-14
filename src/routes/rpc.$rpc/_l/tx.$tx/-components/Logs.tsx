import { Card } from "@ethui/ui/components/shadcn/card";
import { type Hash, decodeEventLog } from "viem";
import { useTransactionReceipt } from "wagmi";
import { LoadingSpinner } from "#/components/LoadingSpinner";
import useAbi from "#/hooks/useAbi";
import { stringifyWithBigInt } from "#/utils/formatters";

export default function Logs({ tx }: { tx: Hash }) {
  const { data: receipt, isLoading: isTransactionReceiptLoading } =
    useTransactionReceipt({
      hash: tx,
    });

  const abi = useAbi({ address: receipt?.to ?? "0x" });
  const logs = abi.abi
    ? receipt?.logs?.map((log) =>
        decodeEventLog({
          abi: abi.abi ?? [],
          data: log.data,
          topics: log.topics,
        }),
      )
    : [];

  console.log(logs);

  if (isTransactionReceiptLoading) {
    return <LoadingSpinner />;
  }

  if (!receipt?.logs || receipt.logs.length === 0) {
    return <div>No logs found</div>;
  }

  return (
    <Card className="flex flex-col rounded-2xl border p-8 shadow-md">
      <pre className="mt-2 w-full whitespace-pre-wrap break-all rounded bg-muted p-4">
        {stringifyWithBigInt(receipt.logs)}
      </pre>
    </Card>
  );
}
