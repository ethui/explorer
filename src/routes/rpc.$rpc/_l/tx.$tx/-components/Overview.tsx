import { Button } from "@ethui/ui/components/shadcn/button";
import { Card } from "@ethui/ui/components/shadcn/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ethui/ui/components/shadcn/dropdown-menu";
import { SolidityCall } from "@ethui/ui/components/solidity-call";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import titleize from "titleize";
import {
  type Abi,
  type Hash,
  type Transaction,
  formatEther,
  hexToBytes,
} from "viem";
import {
  useBlock,
  useChainId,
  useTransaction,
  useTransactionReceipt,
} from "wagmi";
import { AddressLink } from "#/components/AddressLink";
import { AddressView } from "#/components/AddressView";
import { Chip } from "#/components/Chip";
import { ResendTransactionDialog } from "#/components/Forms/ResendTransactionDialogForm";
import { LinkText } from "#/components/LinkText";
import { LoadingSpinner } from "#/components/LoadingSpinner";
import useAbi from "#/hooks/useAbi";
import { formatRelativeTime } from "#/utils/time";

export default function Overview({ tx }: { tx: Hash }) {
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
    <Card className="flex flex-col rounded-lg border p-8 pb-2 shadow-sm">
      <TransactionLabelValue
        label="Transaction Hash:"
        value={transaction?.hash}
      />
      {receipt && (
        <TransactionLabelValue
          label="Status:"
          value={
            <Chip
              variant={receipt.status === "success" ? "success" : "error"}
              showIcon={true}
            >
              {titleize(receipt.status)}
            </Chip>
          }
        />
      )}
      <TransactionLabelValue
        label="Block:"
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
          label="Timestamp:"
          value={<Timestamp timestamp={block.timestamp} />}
        />
      )}

      <TransactionLabelValue
        label="From:"
        value={<AddressLink address={transaction.from} />}
      />

      {transaction?.to && (
        <TransactionLabelValue
          label="To:"
          value={<AddressLink address={transaction.to} />}
        />
      )}

      <TransactionLabelValue
        label="Value:"
        value={<span>{formatEther(transaction?.value)} ETH</span>}
      />

      {receipt && (
        <TransactionLabelValue
          label="Transaction Fee:"
          value={
            <span>
              {formatEther(receipt.gasUsed * receipt.effectiveGasPrice)} ETH
            </span>
          }
        />
      )}
      <TransactionLabelValue
        label="Gas Price:"
        value={<span>{formatEther(transaction.gasPrice ?? 0n)} ETH</span>}
      />
      <TransactionLabelValue label="Nonce" value={transaction.nonce} />
      <TransactionLabelValue
        label="Transaction Type:"
        value={<Chip variant="default">{titleize(transaction.type)}</Chip>}
      />

      <TransactionLabelValue
        label="Input Data:"
        value={<InputDetails transaction={transaction} />}
      />
    </Card>
  );
}

function InputDetails({ transaction }: { transaction: Transaction }) {
  const abi = useAbi({ address: transaction.to ?? "0x" });
  const chainId = useChainId();
  const isTransfer = transaction.input === "0x";

  const [displayMode, setDisplayMode] = useState<
    "default" | "utf8" | "original"
  >(isTransfer ? "original" : "default");

  return (
    <div className="flex flex-col gap-2">
      <InputDetailsByType
        transaction={transaction}
        displayMode={displayMode}
        abi={abi.abi}
      />
      {!isTransfer && (
        <div className="flex flex-row gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-fit bg-accent text-xs focus:outline-none focus:ring-0 focus-visible:ring-0"
              >
                <span className="capitalize">{displayMode}</span>
                <ChevronDown className="ml-2 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-32">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setDisplayMode("default")}
              >
                Default
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setDisplayMode("original")}
              >
                Original
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setDisplayMode("utf8")}
              >
                UTF-8
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {transaction.to && (
            <ResendTransactionDialog
              trigger={
                <Button variant="outline" size="sm" className="bg-accent">
                  Resend
                </Button>
              }
              to={transaction.to}
              input={transaction.input}
              value={transaction.value}
              abi={abi.abi}
              chainId={chainId}
              sender={transaction.from}
            />
          )}
        </div>
      )}
    </div>
  );
}

function hexToUtf8Safe(hex: string): string {
  const bytes = hexToBytes(hex as `0x${string}`);
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

function InputDetailsByType({
  transaction,
  displayMode,
  abi,
}: {
  transaction: Transaction;
  abi: Abi | undefined;
  displayMode: "default" | "utf8" | "original";
}) {
  const chainId = useChainId();
  return (
    <div className="max-h-40 min-h-20 w-full overflow-auto rounded-md border border-r-4 bg-accent p-4">
      {displayMode === "default" && (
        <div className="text-muted-foreground text-sm">
          <SolidityCall
            value={transaction.value}
            data={transaction.input}
            from={transaction.from}
            to={transaction.to ?? undefined}
            chainId={chainId}
            abi={abi}
            ArgProps={{
              addressRenderer: (address) => <AddressView address={address} />,
            }}
          />
        </div>
      )}
      {displayMode === "original" && (
        <div className="text-muted-foreground text-sm">{transaction.input}</div>
      )}
      {displayMode === "utf8" && (
        <div className="text-muted-foreground text-sm">
          {hexToUtf8Safe(transaction.input)}
        </div>
      )}
    </div>
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
    <div className="flex flex-row pb-6">
      <div className="w-1/4 flex-shrink-0 pr-4 text-muted-foreground text-sm">
        {label}
      </div>
      <div className="flex-1 break-all text-sm">{value}</div>
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
