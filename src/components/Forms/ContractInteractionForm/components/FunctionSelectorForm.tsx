import { AbiItemFormWithPreview } from "@ethui/ui/components/abi-form/abi-item-form-with-preview";
import { FormProvider } from "react-hook-form";
import { ContractFunctionInput } from "./ContractFunctionInput";
import {
  ConnectWalletAlert,
  MsgSenderInput,
  ActionButtons,
} from "./SharedComponents";
import { useFunctionForm } from "../hooks/useFunctionForm";
import type { UseContractExecutionReturn } from "../types";
import type { Address } from "viem";

interface FunctionSelectorFormProps {
  execution: UseContractExecutionReturn;
  address: Address;
}

export function FunctionSelectorForm({
  execution,
  address,
}: FunctionSelectorFormProps) {
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
            chainId={31337}
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
