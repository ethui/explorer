import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { AbiFunction, Address } from "viem";
import { decodeFunctionData, isAddress } from "viem";
import { formatAbiItem } from "viem/utils";
import { z } from "zod";
import useAbi from "#/hooks/useAbi";

const functionFormSchema = z.object({
  msgSender: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        return isAddress(val);
      },
      { message: "Invalid address format" },
    )
    .optional(),
});

export function useFunctionForm(
  address: Address,
  initialCallData?: string,
  onUserInteraction?: () => void,
) {
  const [selectedFunction, setSelectedFunction] = useState<AbiFunction | null>(
    null,
  );
  const [callData, setCallData] = useState<string | undefined>(undefined);
  const { abi } = useAbi({ address });

  const functionForm = useForm({
    mode: "onChange",
    resolver: zodResolver(functionFormSchema),
    defaultValues: {
      msgSender: "",
    },
  });

  const contractFunctions = useMemo(() => {
    if (!abi) return [];
    return abi.filter((item) => item.type === "function") as AbiFunction[];
  }, [abi]);

  // Auto-select function based on initial callData
  useEffect(() => {
    if (
      initialCallData &&
      abi &&
      contractFunctions.length > 0 &&
      !selectedFunction
    ) {
      try {
        const decoded = decodeFunctionData({
          abi,
          data: initialCallData as `0x${string}`,
        });

        const matchingFunction = contractFunctions.find(
          (func) => func.name === decoded.functionName,
        );

        if (matchingFunction) {
          setSelectedFunction(matchingFunction);
          setCallData(initialCallData);
        }
      } catch (error) {
        console.warn("Failed to decode initial callData:", error);
      }
    }
  }, [initialCallData, abi, contractFunctions, selectedFunction]);

  const msgSender = functionForm.watch().msgSender || "";

  const handleSelectFunction = (func: AbiFunction) => {
    setSelectedFunction(func);
    setCallData(undefined);
    onUserInteraction?.();
  };

  const isWrite = useMemo(() => {
    if (!selectedFunction) return false;
    return (
      selectedFunction.stateMutability !== "view" &&
      selectedFunction.stateMutability !== "pure"
    );
  }, [selectedFunction]);

  const signature = selectedFunction ? formatAbiItem(selectedFunction) : "";

  return {
    functionForm,
    selectedFunction,
    setSelectedFunction,
    handleSelectFunction,
    callData,
    setCallData,
    contractFunctions,
    msgSender,
    isWrite,
    signature,
  };
}
