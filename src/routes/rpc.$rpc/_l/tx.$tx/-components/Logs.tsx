import { Card } from "@ethui/ui/components/shadcn/card";
import {
  type Abi,
  type AbiEvent,
  type Hash,
  type Log,
  decodeEventLog,
} from "viem";
import { useTransactionReceipt } from "wagmi";
import { AddressLink } from "#/components/AddressLink";
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
    ? receipt?.logs?.map((log) => decodeLogWithTypes(abi.abi!, log))
    : null;

  if (isTransactionReceiptLoading) {
    return <LoadingSpinner />;
  }

  if (!receipt?.logs || receipt.logs.length === 0) {
    return <div>No logs found</div>;
  }

  return (
    <Card className="rounded-lg border p-8 shadow-sm">
      <div className="mb-6">
        <h3 className="font-medium text-sm">Transaction Receipt Event Logs</h3>
      </div>
      <div>
        {logs
          ? logs.map((log, index) => (
              <div key={index}>
                <LogDisplay log={log} index={index} />
                {index < logs.length - 1 && (
                  <hr className="my-4 border-muted border-t" />
                )}
              </div>
            ))
          : receipt.logs.map((log, index) => (
              <div key={index}>
                <RawLogDisplay log={log} index={index} />
                {index < receipt.logs.length - 1 && (
                  <hr className="my-4 border-muted border-t" />
                )}
              </div>
            ))}
      </div>
    </Card>
  );
}

function decodeLogWithTypes(abi: Abi, log: Log) {
  try {
    const parsed = decodeEventLog({
      abi,
      data: log.data,
      topics: log.topics,
    });
    const abiItem = abi.find(
      (item): item is AbiEvent =>
        item.type === "event" && item.name === parsed.eventName,
    );

    if (!abiItem)
      throw new Error(`Event ABI not found for ${parsed.eventName}`);

    const args = Object.entries(parsed.args || {}).map(([name, value]) => {
      const input = abiItem.inputs.find((i) => i.name === name);
      return {
        name,
        type: input?.type || "unknown",
        indexed: input?.indexed || false,
        value,
      };
    });

    return {
      eventName: parsed.eventName,
      args,
      raw: log,
    };
  } catch (error) {
    return {
      eventName: "Unknown",
      args: [],
      raw: log,
      error: error instanceof Error ? error.message : "Failed to decode log",
    };
  }
}

function formatValue(value: any, type: string) {
  if (type === "address") {
    return <AddressLink address={value as `0x${string}`} text={value} />;
  }
  return stringifyWithBigInt(value).replace(/"/g, "");
}

function LogCard({
  children,
  logIndex,
}: {
  children: React.ReactNode;
  index: number;
  logIndex?: number;
}) {
  return (
    <div className="flex items-start gap-14 py-4">
      <div className="mt-1 flex-shrink-0">
        <div className="flex size-12 items-center justify-center rounded-full border border-success/20 bg-success/10 font-medium text-sm text-success">
          {logIndex ?? "NA"}
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function LogSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-row pb-6">
      <div className="flex w-24 flex-shrink-0 items-center justify-end pr-4 text-muted-foreground text-sm">
        {title}:
      </div>
      <div className="flex-1 break-all text-sm">{children}</div>
    </div>
  );
}

function TopicItem({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center gap-4">
      <span className="flex w-4 items-center justify-center text-muted-foreground text-xs">
        {index}
      </span>
      <div className="flex-1 break-all rounded bg-muted p-2 font-mono text-xs">
        {children}
      </div>
    </div>
  );
}

function DataItem({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 break-all rounded bg-muted p-2 font-mono text-xs">
        {label && (
          <span className="mr-2 text-muted-foreground text-xs">{label}:</span>
        )}
        {children}
      </div>
    </div>
  );
}

function TopicsSection({
  topics,
  indexedArgs,
  formatValue,
}: {
  topics: readonly `0x${string}`[];
  indexedArgs: any[];
  formatValue?: (value: any, type: string) => any;
}) {
  return (
    <div className="flex flex-row pb-6">
      <div className="flex w-24 flex-shrink-0 items-start justify-end pr-4 text-muted-foreground text-sm">
        <span className="mt-1">Topics:</span>
      </div>
      <div className="flex-1 break-all text-sm">
        <div className="space-y-2">
          <TopicItem index={0}>{topics[0]}</TopicItem>
          {formatValue &&
            indexedArgs.map((arg, i) => (
              <TopicItem key={i} index={i + 1}>
                <span className="mr-2 text-muted-foreground text-xs">
                  {arg.name}:
                </span>
                {formatValue(arg.value, arg.type)}
              </TopicItem>
            ))}
          {indexedArgs.length === 0 &&
            topics.slice(1).map((topic, i) => (
              <TopicItem key={i + 1} index={i + 1}>
                {topic}
              </TopicItem>
            ))}
        </div>
      </div>
    </div>
  );
}

function LogDisplay({
  log,
  index,
}: {
  log: ReturnType<typeof decodeLogWithTypes>;
  index: number;
}) {
  const indexedArgs = log.args.filter((arg) => arg.indexed);
  const nonIndexedArgs = log.args.filter((arg) => !arg.indexed);

  return (
    <LogCard index={index} logIndex={log.raw.logIndex ?? undefined}>
      <LogSection title="Address">
        <AddressLink address={log.raw.address} />
      </LogSection>

      <LogSection title="Name">
        <div className="rounded bg-muted p-2 font-mono text-sm">
          <span>{log.eventName}</span>
          {log.args.length > 0 && (
            <span>
              {" ("}
              {log.args.map((arg, i) => (
                <span key={i}>
                  {arg.indexed && (
                    <span>index_topic_{indexedArgs.indexOf(arg) + 1} </span>
                  )}
                  <span className="text-success">{arg.type}</span>{" "}
                  <span className="text-error">{arg.name}</span>
                  {i < log.args.length - 1 && ", "}
                </span>
              ))}
              {")"}
            </span>
          )}
        </div>
      </LogSection>

      {log.raw.topics.length > 0 && (
        <TopicsSection
          topics={log.raw.topics}
          indexedArgs={indexedArgs}
          formatValue={formatValue}
        />
      )}

      {nonIndexedArgs.length > 0 && (
        <LogSection title="Data">
          <div className="space-y-2">
            {nonIndexedArgs.map((arg, i) => (
              <DataItem key={i} label={arg.name}>
                {formatValue(arg.value, arg.type)}
              </DataItem>
            ))}
          </div>
        </LogSection>
      )}

      {log.error && (
        <div className="mb-4 rounded border border-error/20 bg-error/10 p-2">
          <span className="text-error text-sm">Error: {log.error}</span>
        </div>
      )}
    </LogCard>
  );
}

function RawLogDisplay({ log, index }: { log: Log; index: number }) {
  return (
    <LogCard index={index} logIndex={log.logIndex ?? undefined}>
      <LogSection title="Address">
        <AddressLink address={log.address} />
      </LogSection>

      <TopicsSection topics={log.topics} indexedArgs={[]} />

      <LogSection title="Data">
        <DataItem>{log.data}</DataItem>
      </LogSection>
    </LogCard>
  );
}
