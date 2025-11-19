import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { Address } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

export interface UseContractExecutionReturn {
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
  isExecuting: boolean;
}

export function useContractExecution(address: Address) {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { isConnected, address: accountAddress } = useAccount();

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
      msgSender,
    }: {
      callData: string;
      value?: bigint;
      msgSender?: Address;
    }): Promise<`0x${string}`> => {
      if (!callData || !publicClient || !walletClient)
        throw new Error("Missing required data");

      const hash = await walletClient.sendTransaction({
        data: callData as Address,
        to: address,
        account: msgSender || accountAddress,
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
    callAsync,
    executeAsync,
    isExecuting,
    isConnected,
  };
}
