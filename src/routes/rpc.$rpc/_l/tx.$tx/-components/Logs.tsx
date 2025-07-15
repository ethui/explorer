import { Card } from "@ethui/ui/components/shadcn/card";
import {
  type Hash,
  Log,
  decodeEventLog,
  parseEventLogs,
  type Abi,
  type AbiEvent,
} from "viem";
import { useTransactionReceipt } from "wagmi";
import { LoadingSpinner } from "#/components/LoadingSpinner";
import { AddressLink } from "#/components/AddressLink";
import useAbi from "#/hooks/useAbi";
import { stringifyWithBigInt } from "#/utils/formatters";

export default function Logs({ tx }: { tx: Hash }) {
  const { data: receipt, isLoading: isTransactionReceiptLoading } =
    useTransactionReceipt({
      hash: tx,
    });

  const abi = useAbi({ address: receipt?.to ?? "0x" });

  const parsedLogs = parseEventLogs({
    abi: abi.abi ?? [],
    logs: receipt?.logs ?? [],
  });

  console.log("parsedLogs", parsedLogs);

  const logs = abi.abi
    ? receipt?.logs?.map((log) => decodeLogWithTypes(abi.abi!, log))
    : null;

  console.log(logs);

  if (isTransactionReceiptLoading) {
    return <LoadingSpinner />;
  }

  if (!receipt?.logs || receipt.logs.length === 0) {
    return <div>No logs found</div>;
  }

  return (
    <div className="space-y-4">
      {logs
        ? logs.map((log, index) => (
            <LogDisplay key={index} log={log} index={index} />
          ))
        : receipt.logs.map((log, index) => (
            <RawLogDisplay key={index} log={log} index={index} />
          ))}
    </div>
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

    return {
      eventName: parsed.eventName,
      args: abiItem.inputs.map((input) => ({
        name: input.name,
        type: input.type,
        indexed: input.indexed,
        value:
          parsed.args && input.name ? (parsed.args as any)[input.name] : null,
      })),
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
  if (typeof value === "string") {
    // Check if it's an address
    if (type === "address" && value.startsWith("0x") && value.length === 42) {
      return <AddressLink address={value as `0x${string}`} text={value} />;
    }
    return value;
  }
  return stringifyWithBigInt(value).replace(/"/g, "");
}

function LogCard({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  return (
    <Card className="mb-4 rounded-lg border p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">
          Transaction Receipt Event Log #{index}
        </h3>
      </div>
      {children}
    </Card>
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
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-sm">{title}</span>
      </div>
      {children}
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
    <div className="flex items-center gap-4">
      <span className="text-xs text-muted-foreground w-4">{index}</span>
      <div className="font-mono text-xs break-all bg-muted p-2 rounded flex-1">
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
      {label && <span className="text-xs text-muted-foreground">{label}:</span>}
      <div className="font-mono text-xs break-all bg-muted p-2 rounded flex-1">
        {children}
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
    <LogCard index={index}>
      <LogSection title="Address">
        <AddressLink address={log.raw.address} />
      </LogSection>

      <LogSection title="Name">
        <div className="font-mono text-sm bg-muted p-2 rounded">
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
        <LogSection title="Topics">
          <div className="space-y-2">
            <TopicItem index={0}>{log.raw.topics[0]}</TopicItem>
            {indexedArgs.map((arg, i) => (
              <TopicItem key={i} index={i + 1}>
                <span className="text-xs text-muted-foreground  mr-2">
                  {arg.name}:
                </span>
                {formatValue(arg.value, arg.type)}
              </TopicItem>
            ))}
          </div>
        </LogSection>
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
        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded">
          <span className="text-red-700 text-sm">Error: {log.error}</span>
        </div>
      )}
    </LogCard>
  );
}

function RawLogDisplay({ log, index }: { log: Log; index: number }) {
  return (
    <LogCard index={index}>
      <LogSection title="Address">
        <AddressLink address={log.address} />
      </LogSection>

      <LogSection title="Topics">
        <div className="space-y-2">
          {log.topics.map((topic, i) => (
            <TopicItem key={i} index={i}>
              {topic}
            </TopicItem>
          ))}
        </div>
      </LogSection>

      <LogSection title="Data">
        <DataItem>{log.data}</DataItem>
      </LogSection>
    </LogCard>
  );
}
