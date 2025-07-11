import { useState } from "react";
import type { Address } from "viem";
import useAbi from "#/hooks/useAbi";
import { FunctionSelectorForm } from "./components/FunctionSelectorForm";
import { ModeSwitch } from "./components/ModeSwitch";
import { SignatureForm } from "./components/SignatureForm";
import { useContractExecution } from "./hooks/useContractExecution";

interface ContractInteractionFormProps {
  address: Address;
  callData?: string;
}

export function ContractInteractionForm({
  address,
  callData,
}: ContractInteractionFormProps) {
  const [useContractFunctions, setUseContractFunctions] = useState(false);
  const [initialCallData, setInitialCallData] = useState(callData);

  const execution = useContractExecution(address);

  const { abi } = useAbi({ address });
  const hasContract = abi?.some((item) => item.type === "function") ?? false;

  return (
    <div className="mx-auto flex flex-col items-center space-y-6 p-6">
      <div className="w-[1000px] rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-6 font-semibold text-2xl">Contract Interaction</h2>

        {hasContract && (
          <ModeSwitch
            useContractFunctions={useContractFunctions}
            setUseContractFunctions={() => {
              setUseContractFunctions(!useContractFunctions);
              execution.resetResult();
              setInitialCallData(undefined);
            }}
          />
        )}

        {!useContractFunctions && hasContract ? (
          <FunctionSelectorForm
            execution={execution}
            address={address}
            callData={initialCallData}
            onUserInteraction={() => setInitialCallData(undefined)}
          />
        ) : (
          <SignatureForm execution={execution} address={address} />
        )}
      </div>
    </div>
  );
}
