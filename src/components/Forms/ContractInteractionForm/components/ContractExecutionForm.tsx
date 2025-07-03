import { AbiItemFormWithPreview } from "@ethui/ui/components/abi-form/abi-item-form-with-preview";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import type { AbiFunction, Address } from "viem";
import { isAddress, parseAbiItem } from "viem";
import { useChainId } from "wagmi";
import { z } from "zod";
import type { UseContractExecutionReturn } from "../hooks/useContractExecution";
import { ResultDisplay } from "./ResultDisplay";
import {
  ActionButtons,
  ConnectWalletAlert,
  MsgSenderInput,
} from "./SharedComponents";

const executionFormSchema = z.object({
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

interface ContractExecutionFormProps {
  execution: UseContractExecutionReturn;
  address: Address;
  abiFunction: AbiFunction | "raw" | "rawCall" | "signature";
  signature?: string;
  defaultCalldata?: `0x${string}`;
  onCallDataChange?: (callData: string | undefined) => void;
  showResult?: boolean;
}

export function ContractExecutionForm({
  execution,
  address,
  abiFunction,
  signature,
  defaultCalldata,
  onCallDataChange,
  showResult = true,
}: ContractExecutionFormProps) {
  const chainId = useChainId();

  const form = useForm({
    mode: "onChange",
    resolver: zodResolver(executionFormSchema),
    defaultValues: {
      msgSender: "",
    },
  });

  const msgSender = form.watch().msgSender || "";

  const parsedAbiFunction = (() => {
    if (typeof abiFunction === "object") {
      return abiFunction;
    } else if (abiFunction === "signature" && signature) {
      try {
        return parseAbiItem(signature) as AbiFunction;
      } catch (error) {
        console.warn("Failed to parse signature:", error);
        return null;
      }
    }
    return null;
  })();

  const isWrite = parsedAbiFunction
    ? parsedAbiFunction.stateMutability !== "view" &&
      parsedAbiFunction.stateMutability !== "pure"
    : false;

  const handleSimulate = (callData: string) => {
    if (!callData || !parsedAbiFunction) return;

    execution.simulate({
      abiFunction: parsedAbiFunction,
      callData,
      msgSender: msgSender ? (msgSender as Address) : undefined,
    });
  };

  const handleExecute = (callData: string) => {
    if (!callData) return;
    execution.execute({ callData });
  };

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        {isWrite && <MsgSenderInput />}

        {isWrite && !execution.isConnected && <ConnectWalletAlert />}

        <AbiItemFormWithPreview
          key={parsedAbiFunction?.name || signature || "raw"}
          onChange={(data) => {
            const callData = data.data?.toString() ?? undefined;
            onCallDataChange?.(callData);
          }}
          abiFunction={parsedAbiFunction || abiFunction}
          signature={signature}
          address={address}
          sender={address}
          chainId={chainId}
          defaultCalldata={defaultCalldata}
        />

        <ActionButtons
          isWrite={isWrite}
          callData={defaultCalldata}
          isSimulating={execution.isSimulating}
          isExecuting={execution.isExecuting}
          isConnected={execution.isConnected}
          simulate={() => defaultCalldata && handleSimulate(defaultCalldata)}
          execute={() => defaultCalldata && handleExecute(defaultCalldata)}
        />

        {showResult && execution.result && (
          <ResultDisplay
            result={execution.result}
            showFullResult={execution.showFullResult}
            setShowFullResult={execution.setShowFullResult}
          />
        )}
      </div>
    </FormProvider>
  );
}
