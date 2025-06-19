import { AbiItemFormWithPreview } from "@ethui/ui/components/abi-form/abi-item-form-with-preview";
import { Form } from "@ethui/ui/components/form";
import { Button } from "@ethui/ui/components/shadcn/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import { type AbiFunction, decodeFunctionData, parseAbiItem } from "viem";
import type { Address } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { z } from "zod";

interface SignatureFormProps {
  address: Address;
}

type Result = {
  type: "simulation" | "execution";
  data: string;
};

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
});

const formatResult = (value: unknown): string =>
  JSON.stringify(
    value,
    (_, v) => (typeof v === "bigint" ? v.toString() : v),
    2,
  );

export function SignatureForm({ address }: SignatureFormProps) {
  const [callData, setCallData] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<Result | undefined>(undefined);
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { isConnected } = useAccount();

  const signatureForm = useForm({
    mode: "onChange",
    resolver: zodResolver(signatureSchema),
    defaultValues: {
      signature: "",
    },
  });

  const signature = signatureForm.watch().signature;
  const isValidSignature = signatureForm.formState.isValid;

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

  async function simulate() {
    if (!callData || !publicClient) return;
    setResult(undefined);

    try {
      const abiItem = parseAbiItem(signature) as AbiFunction;
      const { args } = decodeFunctionData({
        abi: [abiItem],
        data: callData as `0x${string}`,
      });

      const result = await publicClient.simulateContract({
        abi: [abiItem],
        address,
        functionName: abiItem.name,
        args,
      });

      setResult({
        type: "simulation",
        data: formatResult({
          result: result.result,
          gasEstimate: result.request.gas,
          status: "success",
        }),
      });
    } catch (error) {
      console.error("Error simulating:", error);
      setResult({
        type: "simulation",
        data: formatResult({
          error: error instanceof Error ? error.message : String(error),
          status: "reverted",
        }),
      });
    }
  }

  async function execute() {
    if (!callData || !publicClient || !walletClient) return;
    setResult(undefined);

    try {
      const hash = await walletClient.sendTransaction({
        data: callData as `0x${string}`,
        to: address,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setResult({
        type: "execution",
        data: formatResult({
          transactionHash: hash,
          gasUsed: receipt.gasUsed,
          status: receipt.status,
        }),
      });
    } catch (error) {
      console.error("Error executing:", error);
      setResult({
        type: "execution",
        data: formatResult({
          error: error instanceof Error ? error.message : String(error),
          status: "reverted",
        }),
      });
    }
  }

  return (
    <div className="mx-auto flex w-fit flex-col items-center space-y-6 p-6">
      <div className="w-full rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-6 font-semibold text-2xl">Contract Interaction</h2>
        <FormProvider {...signatureForm}>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Form.Text
                label={<span className="font-bold">Signature</span>}
                name="signature"
                placeholder="function transfer(address to, uint256 amount) returns (bool)"
                className="w-4xl"
                onChange={() => setResult(undefined)}
              />
            </div>

            {isValidSignature && (
              <>
                {isWrite && !isConnected && (
                  <div className="mb-4 border-yellow-500 border-l-4 bg-yellow-100 p-4 text-yellow-700">
                    Connect your wallet to execute this write function
                  </div>
                )}
                <h3 className="font-medium text-lg">Parameters</h3>
                <AbiItemFormWithPreview
                  key={signature}
                  onChange={(data) => {
                    setCallData(data.data?.toString() ?? undefined);
                  }}
                  abiFunction={"signature"}
                  signature={signature}
                  address={address}
                  sender={address}
                  chainId={1}
                />

                <div className="mt-4 flex justify-center gap-2">
                  {isWrite ? (
                    <>
                      <Button
                        type="button"
                        disabled={!callData}
                        onClick={simulate}
                      >
                        Simulate
                      </Button>
                      <Button
                        type="button"
                        disabled={!isConnected || !callData}
                        onClick={() => (isWrite ? execute() : simulate())}
                      >
                        Execute
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      disabled={!callData}
                      onClick={() => simulate()}
                    >
                      Call
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </FormProvider>
      </div>

      {result && (
        <div className="w-full rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-lg">
            {result.type === "simulation" ? "Simulated Result" : "Result"}
          </h3>
          <pre className="whitespace-pre-wrap break-all rounded bg-muted p-4">
            {result.data}
          </pre>
        </div>
      )}
    </div>
  );
}
