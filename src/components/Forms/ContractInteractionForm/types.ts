import type { Address, AbiFunction } from "viem";

export interface ContractInteractionFormProps {
  address: Address;
}

export type Result = {
  type: "call" | "simulation" | "execution";
  data: string;
  hash?: string;
  cleanResult?: string;
};

export interface FormData {
  signature: string;
  msgSender: string;
}

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
