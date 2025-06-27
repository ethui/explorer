import { AbiItemFormWithPreview } from "@ethui/ui/components/abi-form/abi-item-form-with-preview";
import { useEffect } from "react";
import { FormProvider } from "react-hook-form";
import type { Address } from "viem";
import { useChainId } from "wagmi";
import type { UseContractExecutionReturn } from "../hooks/useContractExecution";
import { useFunctionForm } from "../hooks/useFunctionForm";
import { ContractFunctionInput } from "./ContractFunctionInput";
import {
  ActionButtons,
  ConnectWalletAlert,
  MsgSenderInput,
} from "./SharedComponents";

interface FunctionSelectorFormProps {
  execution: UseContractExecutionReturn;
  address: Address;
}

export function FunctionSelectorForm({
  execution,
  address,
}: FunctionSelectorFormProps) {
  const chainId = useChainId();
  const formData = useFunctionForm(address);
  const {
    functionForm,
    selectedFunction,
    handleSelectFunction,
    callData,
    setCallData,
    contractFunctions,
    msgSender,
    isWrite,
  } = formData;

  useEffect(() => {
    if (selectedFunction !== undefined) {
      execution.resetResult();
    }
  }, [selectedFunction, execution.resetResult]);

  const handleSimulate = () => {
    if (!callData || !selectedFunction) return;
    execution.simulate({
      abiFunction: selectedFunction,
      callData,
      msgSender: msgSender ? (msgSender as Address) : undefined,
    });
  };

  const handleExecute = () => {
    if (!callData) return;
    execution.execute({ callData });
  };

  return (
    <FormProvider {...functionForm}>
      <ContractFunctionInput
        functions={contractFunctions}
        onSelectFunction={handleSelectFunction}
      />

      {selectedFunction && (
        <>
          {isWrite && <MsgSenderInput />}

          {isWrite && !execution.isConnected && <ConnectWalletAlert />}

          <AbiItemFormWithPreview
            key={selectedFunction.name}
            onChange={(data) => {
              setCallData(data.data?.toString() ?? undefined);
            }}
            abiFunction={selectedFunction}
            address={address}
            sender={address}
            chainId={chainId}
          />

          <ActionButtons
            isWrite={isWrite}
            callData={callData}
            isSimulating={execution.isSimulating}
            isExecuting={execution.isExecuting}
            isConnected={execution.isConnected}
            simulate={handleSimulate}
            execute={handleExecute}
          />
        </>
      )}
    </FormProvider>
  );
}
