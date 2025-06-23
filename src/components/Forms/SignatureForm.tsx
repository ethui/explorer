import { AbiItemFormWithPreview } from "@ethui/ui/components/abi-form/abi-item-form-with-preview";
import { Form } from "@ethui/ui/components/form";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@ethui/ui/components/shadcn/alert";
import { Button } from "@ethui/ui/components/shadcn/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import toast from "react-hot-toast";
import {
  type AbiFunction,
  decodeFunctionData,
  isAddress,
  parseAbiItem,
} from "viem";
import type { Address } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { z } from "zod";

interface SignatureFormProps {
  address: Address;
}

type Result = {
  type: "call" | "simulation" | "execution";
  data: string;
  hash?: string;
  cleanResult?: string;
};

const signatureSchema = z.object({
  signature: z.string().refine(
    (val) => {
      try {
        parseAbiItem(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Invalid function signature" },
  ),
  msgSender: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        return isAddress(val);
      },
      { message: "Invalid address format" },
    )
    .optional(),
});

const formatResult = (value: unknown): string =>
  JSON.stringify(
    value,
    (_, v) => (typeof v === "bigint" ? v.toString() : v),
    2,
  );

export function SignatureForm({ address }: SignatureFormProps) {
  const [callData, setCallData] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<Result | undefined>(undefined);
  const [showFullResult, setShowFullResult] = useState(false);
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { isConnected, address: accountAddress } = useAccount();

  const signatureForm = useForm({
    mode: "onChange",
    resolver: zodResolver(signatureSchema),
    defaultValues: {
      signature: "",
      msgSender: "",
    },
  });

  const signature = signatureForm.watch().signature;
  const msgSender = signatureForm.watch().msgSender;
  const isValidSignature =
    signatureForm.getFieldState("signature").invalid === false &&
    signature.length > 0;

  useEffect(() => {
    if (signature !== undefined) {
      setResult(undefined);
    }
  }, [signature]);

  const isWrite = useMemo(() => {
    try {
      const abiItem = parseAbiItem(signature) as AbiFunction;
      return (
        abiItem.stateMutability !== "view" && abiItem.stateMutability !== "pure"
      );
    } catch {
      return false;
    }
  }, [signature]);

  const { mutate: simulate, isPending: isSimulating } = useMutation({
    mutationFn: async () => {
      if (!callData || !publicClient) throw new Error("Missing required data");

      const abiItem = parseAbiItem(signature) as AbiFunction;
      const { args } = decodeFunctionData({
        abi: [abiItem],
        data: callData as `0x${string}`,
      });

      const result = await publicClient.simulateContract({
        abi: [abiItem],
        address,
        functionName: abiItem.name,
        args,
        account: (msgSender as Address) || accountAddress,
      });

      const formattedResult = formatResult(result);
      const cleanResult = isWrite
        ? undefined
        : (result.result as any)?.toString();

      return {
        type: isWrite ? "simulation" : "call",
        data: formattedResult,
        cleanResult,
      };
    },
    onSuccess: (data) => {
      setResult(data as Result);
      toast.success(isWrite ? "Simulation successful" : "Call successful");
    },
    onError: (error) => {
      setResult({
        type: isWrite ? "simulation" : "call",
        data: formatResult({
          error: error instanceof Error ? error.message : String(error),
          status: "reverted",
        }),
      });
      toast.error(isWrite ? "Simulation failed" : "Call failed");
    },
  });

  const { mutate: execute, isPending: isExecuting } = useMutation({
    mutationFn: async () => {
      if (!callData || !publicClient || !walletClient)
        throw new Error("Missing required data");

      const hash = await walletClient.sendTransaction({
        data: callData as `0x${string}`,
        to: address,
      });

      setResult({
        type: "execution",
        data: "",
        hash: hash,
      });

      toast.promise(publicClient.waitForTransactionReceipt({ hash }), {
        loading: "Waiting for transaction to be executed",
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      return {
        type: "execution" as const,
        data: formatResult(receipt),
        hash: hash,
      };
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success("Transaction executed");
    },
    onError: (error) => {
      setResult({
        type: "execution",
        data: formatResult({
          error: error instanceof Error ? error.message : String(error),
          status: "reverted",
        }),
      });
      toast.error("Transaction failed");
    },
  });

  return (
    <div className="mx-auto flex w-fit flex-col items-center space-y-6 p-6">
      <div className="w-full rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-6 font-semibold text-2xl">Contract Interaction</h2>
        <FormProvider {...signatureForm}>
          <div className="flex flex-col">
            <SignatureInput />

            {isValidSignature && (
              <>
                {isWrite && <MsgSenderInput />}

                {isWrite && !isConnected && <ConnectWalletAlert />}

                <AbiItemFormWithPreview
                  key={signature}
                  onChange={(data) => {
                    setCallData(data.data?.toString() ?? undefined);
                  }}
                  abiFunction={"signature"}
                  signature={signature}
                  address={address}
                  sender={address}
                  chainId={31337}
                />

                <ActionButtons
                  isWrite={isWrite}
                  callData={callData}
                  isSimulating={isSimulating}
                  isExecuting={isExecuting}
                  isConnected={isConnected}
                  simulate={simulate}
                  execute={execute}
                />
              </>
            )}
          </div>
        </FormProvider>
      </div>

      {result && (
        <ResultDisplay
          result={result}
          showFullResult={showFullResult}
          setShowFullResult={setShowFullResult}
        />
      )}
    </div>
  );
}

function SignatureInput() {
  return (
    <Form.Text
      label={<span className="font-bold text-base">Signature</span>}
      name="signature"
      placeholder="function transfer(address to, uint256 amount) returns (bool)"
      className="w-4xl"
    />
  );
}

function MsgSenderInput() {
  return (
    <div className="mt-4">
      <Form.Text
        name="msgSender"
        label={
          <span className="font-bold text-base">Msg Sender (Optional)</span>
        }
        placeholder="0x..."
        className="w-4xl"
      />
      <p className="mt-1 text-muted-foreground text-sm">
        Leave empty to use connected wallet address for simulation
      </p>
    </div>
  );
}

function ConnectWalletAlert() {
  return (
    <Alert className="mb-4">
      <Info className="h-4 w-4" />
      <AlertTitle>Connect your wallet</AlertTitle>
      <AlertDescription>
        Connect your wallet to execute this write function
      </AlertDescription>
    </Alert>
  );
}

function ActionButtons({
  isWrite,
  callData,
  isSimulating,
  isExecuting,
  isConnected,
  simulate,
  execute,
}: {
  isWrite: boolean;
  callData: string | undefined;
  isSimulating: boolean;
  isExecuting: boolean;
  isConnected: boolean;
  simulate: () => void;
  execute: () => void;
}) {
  return (
    <div className="mt-6 flex justify-center gap-2">
      {isWrite ? (
        <>
          <Button
            type="button"
            disabled={!callData || isSimulating || isExecuting}
            onClick={() => simulate()}
          >
            Simulate
          </Button>
          <Button
            type="button"
            disabled={!isConnected || !callData || isExecuting || isSimulating}
            onClick={() => execute()}
          >
            Execute
          </Button>
        </>
      ) : (
        <Button
          type="button"
          disabled={!callData || isSimulating}
          onClick={() => simulate()}
        >
          Call
        </Button>
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

function ResultDisplay({
  result,
  showFullResult,
  setShowFullResult,
}: {
  result: Result;
  showFullResult: boolean;
  setShowFullResult: (show: boolean) => void;
}) {
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
