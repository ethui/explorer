import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  type AbiFunction,
  decodeFunctionData,
  encodeFunctionResult,
} from "viem";
import type { Address } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

export interface UseContractExecutionReturn {
  simulateAsync: (params: {
    abiFunction: AbiFunction;
    callData: string;
    msgSender?: Address | undefined;
  }) => Promise<`0x${string}`>;
  callAsync: (params: {
    data: `0x${string}`;
    value?: bigint;
    msgSender?: Address;
  }) => Promise<`0x${string}`>;
  executeAsync: (params: {
    callData: string;
    value?: bigint;
  }) => Promise<`0x${string}`>;
  isConnected: boolean;
  isSimulating: boolean;
  isExecuting: boolean;
}

const isWriteFunction = (abiFunction: AbiFunction): boolean =>
  abiFunction.stateMutability !== "view" &&
  abiFunction.stateMutability !== "pure";

export function useContractExecution(address: Address) {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { isConnected, address: accountAddress } = useAccount();

  const { mutateAsync: simulateAsync, isPending: isSimulating } = useMutation({
    mutationFn: async ({
      abiFunction,
      callData,
      msgSender,
    }: {
      abiFunction: AbiFunction;
      callData: string;
      msgSender?: string;
    }): Promise<`0x${string}`> => {
      if (!callData || !publicClient) throw new Error("Missing required data");

      const { args } = decodeFunctionData({
        abi: [abiFunction],
        data: callData as Address,
      });

      const result = await publicClient.simulateContract({
        abi: [abiFunction],
        address,
        functionName: abiFunction.name,
        args,
        account: msgSender ? (msgSender as Address) : accountAddress,
      });

      const encoded = encodeFunctionResult({
        abi: [abiFunction],
        functionName: abiFunction.name,
        result: result.result,
      });

      return encoded;
    },
    onSuccess: (_data, variables) => {
      const isWrite = isWriteFunction(variables.abiFunction);
      toast.success(isWrite ? "Simulation successful" : "Call successful");
    },
    onError: (error, variables) => {
      const isWrite = isWriteFunction(variables.abiFunction);
      toast.error(isWrite ? "Simulation failed" : "Call failed");
      throw error;
    },
  });

  const { mutateAsync: callAsync } = useMutation({
    mutationFn: async ({
      data,
      value,
      msgSender,
    }: {
      data: `0x${string}`;
      value?: bigint;
      msgSender?: Address;
    }): Promise<`0x${string}`> => {
      if (!publicClient) throw new Error("Missing public client");

      const result = await publicClient.call({
        to: address,
        data,
        value,
        account: msgSender || accountAddress,
      });

      return result.data || "0x";
    },
    onSuccess: () => {
      toast.success("Call successful");
    },
    onError: (error) => {
      toast.error("Call failed");
      throw error;
    },
  });

  const { mutateAsync: executeAsync, isPending: isExecuting } = useMutation({
    mutationFn: async ({
      callData,
      value,
    }: {
      callData: string;
      value?: bigint;
    }): Promise<`0x${string}`> => {
      if (!callData || !publicClient || !walletClient)
        throw new Error("Missing required data");

      const hash = await walletClient.sendTransaction({
        data: callData as Address,
        to: address,
        value,
      });

      toast.promise(publicClient.waitForTransactionReceipt({ hash }), {
        loading: "Waiting for transaction to be executed",
        success: "Transaction executed",
        error: "Transaction failed",
      });

      await publicClient.waitForTransactionReceipt({ hash });

      return hash;
    },
    onError: (error) => {
      toast.error("Transaction failed");
      throw error;
    },
  });

  return {
    simulateAsync,
    callAsync,
    executeAsync,
    isSimulating,
    isExecuting,
    isConnected,
  };
}
