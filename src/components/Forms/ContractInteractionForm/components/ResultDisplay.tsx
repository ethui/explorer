import { Button } from "@ethui/ui/components/shadcn/button";
import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Result } from "../types";

interface ResultDisplayProps {
  result: Result;
  showFullResult: boolean;
  setShowFullResult: (show: boolean) => void;
}

export function ResultDisplay({
  result,
  showFullResult,
  setShowFullResult,
}: ResultDisplayProps) {
  const getTitle = () => {
    switch (result.type) {
      case "call":
        return "Call Result";
      case "simulation":
        return "Simulation Result";
      case "execution":
        return "Transaction Receipt";
    }
  };

  return (
    <div className="w-full rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-lg">{getTitle()}</h3>

      {result.hash && <TransactionHash hash={result.hash} />}

      {result.type === "call" && result.cleanResult && (
        <CollapsibleResult
          title="Result"
          content={result.cleanResult}
          showFullResult={showFullResult}
          setShowFullResult={setShowFullResult}
          result={result}
        />
      )}

      {result.type === "call" && !result.cleanResult && result.data && (
        <CollapsibleResult
          title="Error"
          content={JSON.parse(result.data).error}
          isError={true}
          showFullResult={showFullResult}
          setShowFullResult={setShowFullResult}
          result={result}
        />
      )}

      {result.type !== "call" && result.data && (
        <pre className="w-full max-w-4xl whitespace-pre-wrap break-all rounded bg-muted p-4">
          {result.data}
        </pre>
      )}
    </div>
  );
}

function TransactionHash({ hash }: { hash: string }) {
  return (
    <div className="mb-4 rounded bg-muted p-3">
      <span className="font-semibold">Transaction Hash: </span>
      <span className="break-all font-mono text-sm">{hash}</span>
    </div>
  );
}

function CollapsibleResult({
  title,
  content,
  isError = false,
  showFullResult,
  setShowFullResult,
  result,
}: {
  title: string;
  content: string;
  isError?: boolean;
  showFullResult: boolean;
  setShowFullResult: (show: boolean) => void;
  result: Result;
}) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <span className={clsx("font-semibold", isError && "text-red-600")}>
          {title}:
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFullResult(!showFullResult)}
          className="h-6 px-2"
        >
          {showFullResult ? (
            <>
              <ChevronUp className="mr-1 h-4 w-4" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 h-4 w-4" />
              Show Details
            </>
          )}
        </Button>
      </div>
      <div
        className={clsx(
          "max-w-4xl rounded border p-3",
          isError ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50",
        )}
      >
        <span className={clsx("font-mono text-sm", isError && "text-red-700")}>
          {content}
        </span>
      </div>

      {showFullResult && (
        <div className="mt-4">
          <span className="font-semibold">
            {isError ? "Full Error Response:" : "Full Response:"}
          </span>
          <pre className="mt-2 w-full max-w-4xl whitespace-pre-wrap break-all rounded bg-muted p-4">
            {result.data}
          </pre>
        </div>
      )}
    </div>
  );
}
