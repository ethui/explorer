import { AbiItemFormWithPreview } from "@ethui/ui/components/abi-form/abi-item-form-with-preview";
import {
  ActionButtons,
  ConnectWalletAlert,
  MsgSenderInput,
} from "./SharedComponents";
import { FormProvider } from "react-hook-form";
import { useSignatureForm } from "../hooks/useSignatureForm";
import type { UseContractExecutionReturn } from "../types";
import type { Address, AbiFunction } from "viem";
import { parseAbiItem } from "viem";
import { Form } from "@ethui/ui/components/form";

interface SignatureFormProps {
  execution: UseContractExecutionReturn;
  address: Address;
}

export function SignatureForm({ execution, address }: SignatureFormProps) {
  const formData = useSignatureForm();
  const {
    signatureForm,
    signature,
    isValidSignature,
    isWrite,
    callData,
    setCallData,
    msgSender,
  } = formData;

  const handleSimulate = () => {
    if (!callData) return;
    const abiFunction = parseAbiItem(signature) as AbiFunction;
    execution.simulate({
      abiFunction,
      callData,
      msgSender: msgSender ? (msgSender as Address) : undefined,
    });
  };

  const handleExecute = () => {
    if (!callData) return;
    execution.execute({ callData });
  };

  return (
    <FormProvider {...signatureForm}>
      <Form.Text
        label={<span className="font-bold text-base">Signature</span>}
        name="signature"
        placeholder="function transfer(address to, uint256 amount) returns (bool)"
        className="w-4xl"
      />

      {isValidSignature && (
        <>
          {isWrite && <MsgSenderInput />}

          {isWrite && !execution.isConnected && <ConnectWalletAlert />}

          <AbiItemFormWithPreview
            key={signature}
            onChange={(data) => {
              setCallData(data.data?.toString() ?? undefined);
            }}
            abiFunction="signature"
            signature={signature}
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
