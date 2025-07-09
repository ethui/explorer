import { Form } from "@ethui/ui/components/form";
import { useEffect } from "react";
import { FormProvider } from "react-hook-form";
import type { AbiFunction, Address } from "viem";
import { parseAbiItem } from "viem";
import type { UseContractExecutionReturn } from "../hooks/useContractExecution";
import { useSignatureForm } from "../hooks/useSignatureForm";
import { ContractExecutionForm } from "./ContractExecutionForm";

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
    callData: formCallData,
    setCallData,
  } = formData;

  const parsedAbiFunction =
    isValidSignature && signature
      ? (() => {
          try {
            return parseAbiItem(signature) as AbiFunction;
          } catch (error) {
            console.warn("Failed to parse signature:", error);
            return null;
          }
        })()
      : null;

  useEffect(() => {
    if (signature !== undefined) {
      execution.resetResult();
    }
  }, [signature, execution.resetResult]);

  return (
    <FormProvider {...signatureForm}>
      <Form.Text
        label={<span className="font-bold text-base">Signature</span>}
        name="signature"
        placeholder="function transfer(address to, uint256 amount) returns (bool)"
        className="w-4xl"
      />
      {isValidSignature && (
        <ContractExecutionForm
          execution={execution}
          address={address}
          abiFunction={parsedAbiFunction || "signature"}
          signature={signature}
          defaultCalldata={formCallData as `0x${string}` | undefined}
          onCallDataChange={setCallData}
        />
      )}{" "}
    </FormProvider>
  );
}
