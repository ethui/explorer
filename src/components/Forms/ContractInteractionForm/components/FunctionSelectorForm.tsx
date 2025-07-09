import { useEffect } from "react";
import type { Address } from "viem";
import type { UseContractExecutionReturn } from "../hooks/useContractExecution";
import { useFunctionForm } from "../hooks/useFunctionForm";
import { ContractExecutionForm } from "./ContractExecutionForm";
import { ContractFunctionInput } from "./ContractFunctionInput";

interface FunctionSelectorFormProps {
  execution: UseContractExecutionReturn;
  address: Address;
  callData?: string;
  onUserInteraction?: () => void;
}

export function FunctionSelectorForm({
  execution,
  address,
  callData,
  onUserInteraction,
}: FunctionSelectorFormProps) {
  const formData = useFunctionForm(address, callData, onUserInteraction);
  const {
    selectedFunction,
    handleSelectFunction,
    callData: formCallData,
    setCallData,
    contractFunctions,
  } = formData;

  useEffect(() => {
    if (selectedFunction !== undefined) {
      execution.resetResult();
    }
  }, [selectedFunction, execution.resetResult]);

  return (
    <div className="space-y-6">
      <ContractFunctionInput
        functions={contractFunctions}
        onSelectFunction={handleSelectFunction}
        selectedFunction={selectedFunction}
      />

      {selectedFunction && (
        <ContractExecutionForm
          execution={execution}
          address={address}
          abiFunction={selectedFunction}
          defaultCalldata={formCallData as `0x${string}` | undefined}
          onCallDataChange={setCallData}
        />
      )}
    </div>
  );
}
