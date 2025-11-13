import { ResendTransaction } from "@ethui/ui/components/contract-execution/resend-transaction/index";
import type {
  ExecutionParams,
  RawCallParams,
} from "@ethui/ui/components/contract-execution/shared/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ethui/ui/components/shadcn/dialog";
import type { ReactNode } from "react";
import type { Abi, Address, Hex } from "viem";
import { useAccount } from "wagmi";
import { useLatestAddresses } from "#/hooks/useLatestAddresses";
import { useContractExecution } from "./ContractInteractionForm/hooks/useContractExecution";

interface ResendTransactionDialogProps {
  trigger: ReactNode;
  to: Address;
  input: Hex;
  value?: bigint;
  abi?: Abi;
  chainId: number;
  sender?: Address;
  onHashClick?: (hash: string) => void;
}

export function ResendTransactionDialog({
  trigger,
  to,
  input,
  value,
  abi,
  chainId,
  sender,
  onHashClick,
}: ResendTransactionDialogProps) {
  const execution = useContractExecution(to);
  const { address: connectedAddress, isConnected } = useAccount();
  const addresses = useLatestAddresses();

  const handleQuery = async (params: ExecutionParams) => {
    return await execution.callAsync({
      data: params.callData,
      value: params.value,
      msgSender: params.msgSender,
    });
  };

  const handleWrite = async (params: ExecutionParams) => {
    return await execution.executeAsync({
      callData: params.callData,
      value: params.value,
    });
  };

  const handleSimulate = async (params: ExecutionParams) => {
    return await execution.simulateAsync({
      abiFunction: params.abiFunction,
      callData: params.callData,
      msgSender: params.msgSender,
    });
  };

  const handleRawTransaction = async (params: RawCallParams) => {
    return await execution.executeAsync({
      callData: params.data,
      value: params.value,
    });
  };

  const addressRenderer = (addr: Address) => {
    const addressData = addresses.find((a) => a.address === addr);
    return addressData?.alias || addr;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Resend Transaction</DialogTitle>
          <DialogDescription>
            Review and resend this transaction with modified parameters
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[600px] overflow-y-auto px-1">
          <ResendTransaction
            to={to}
            input={input}
            value={value}
            abi={abi}
            chainId={chainId}
            sender={sender || connectedAddress}
            addresses={addresses}
            requiresConnection={true}
            isConnected={isConnected}
            onQuery={handleQuery}
            onWrite={handleWrite}
            onSimulate={handleSimulate}
            onRawTransaction={handleRawTransaction}
            addressRenderer={addressRenderer}
            onHashClick={onHashClick}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
