import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { type AbiFunction, decodeFunctionData } from "viem";
import type { Address } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { stringifyWithBigInt } from "#/utils/formatters";
import type { Result } from "../components/ResultDisplay";
export interface UseContractExecutionReturn {
  simulate: (params: {
    abiFunction: AbiFunction;
    callData: string;
    msgSender?: Address | undefined;
  }) => void;
  execute: (params: { callData: string }) => void;
  isConnected: boolean;
  isSimulating: boolean;
  isExecuting: boolean;
  result: any;
  showFullResult: boolean;
  setShowFullResult: (show: boolean) => void;
  resetResult: () => void;
}

const isWriteFunction = (abiFunction: AbiFunction): boolean =>
  abiFunction.stateMutability !== "view" &&
  abiFunction.stateMutability !== "pure";

export function useContractExecution(address: Address) {
  const [result, setResult] = useState<Result | undefined>(undefined);
  const [showFullResult, setShowFullResult] = useState(false);
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { isConnected, address: accountAddress } = useAccount();

  const { mutate: simulate, isPending: isSimulating } = useMutation({
    mutationFn: async ({
      abiFunction,
      callData,
      msgSender,
    }: {
      abiFunction: AbiFunction;
      callData: string;
      msgSender?: string;
    }) => {
      if (!callData || !publicClient) throw new Error("Missing required data");

      const { args } = decodeFunctionData({
        abi: [abiFunction],
        data: callData as Address,
      });

      const isWrite = isWriteFunction(abiFunction);

      const result = await publicClient.simulateContract({
        abi: [abiFunction],
        address,
        functionName: abiFunction.name,
        args,
        account: msgSender ? (msgSender as Address) : accountAddress,
      });
      const formattedResult = stringifyWithBigInt(result);
      const cleanResult = isWrite
        ? undefined
        : (result.result as any)?.toString();

      return {
        type: isWrite ? "simulation" : "call",
        data: formattedResult,
        cleanResult,
      };
    },
    onSuccess: (data, variables) => {
      setResult(data as Result);
      const isWrite = isWriteFunction(variables.abiFunction);
      toast.success(isWrite ? "Simulation successful" : "Call successful");
    },
    onError: (error, variables) => {
      const isWrite = isWriteFunction(variables.abiFunction);
      setResult({
        type: isWrite ? "simulation" : "call",
        data: stringifyWithBigInt({
          error: error instanceof Error ? error.message : String(error),
          status: "reverted",
        }),
      });
      toast.error(isWrite ? "Simulation failed" : "Call failed");
    },
  });

  const { mutate: execute, isPending: isExecuting } = useMutation({
    mutationFn: async ({ callData }: { callData: string }) => {
      if (!callData || !publicClient || !walletClient)
        throw new Error("Missing required data");

      const hash = await walletClient.sendTransaction({
        data: callData as Address,
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
        data: stringifyWithBigInt(receipt),
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
        data: stringifyWithBigInt({
          error: error instanceof Error ? error.message : String(error),
          status: "reverted",
        }),
      });
      toast.error("Transaction failed");
    },
  });

  const resetResult = useCallback(() => {
    setResult(undefined);
    setShowFullResult(false);
  }, []);

  return {
    result,
    showFullResult,
    setShowFullResult,
    simulate,
    execute,
    isSimulating,
    isExecuting,
    isConnected,
    resetResult,
  };
}
