import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { type AbiFunction, isAddress, parseAbiItem } from "viem";
import { z } from "zod";

const signatureSchema = z.object({
  signature: z.string().refine(
    (val) => {
      try {
        parseAbiItem(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Invalid function signature" },
  ),
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

export function useSignatureForm() {
  const [callData, setCallData] = useState<string | undefined>(undefined);

  const signatureForm = useForm({
    mode: "onChange",
    resolver: zodResolver(signatureSchema),
    defaultValues: {
      signature: "",
      msgSender: "",
    },
  });

  const signature = signatureForm.watch().signature;
  const msgSender = signatureForm.watch().msgSender || "";
  const isValidSignature =
    signatureForm.getFieldState("signature").invalid === false &&
    signature.length > 0;

  const isWrite = useMemo(() => {
    try {
      const abiItem = parseAbiItem(signature) as AbiFunction;
      return (
        abiItem.stateMutability !== "view" && abiItem.stateMutability !== "pure"
      );
    } catch {
      return false;
    }
  }, [signature]);

  return {
    signatureForm,
    signature,
    msgSender,
    isValidSignature,
    isWrite,
    callData,
    setCallData,
  };
}
