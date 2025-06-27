import { Form } from "@ethui/ui/components/form";
import { Button } from "@ethui/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ethui/ui/components/shadcn/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { Abi, Address } from "viem";
import { z } from "zod";
import useAbi from "#/hooks/useAbi";
import useIsEthui from "#/hooks/useIsEthui";
import { useContractsStore } from "#/store/contracts";

const abiSchema = z.object({
  abi: z
    .string()
    .min(1, "ABI is required")
    .refine(
      (val) => {
        try {
          const parsed = JSON.parse(val);
          return (
            Array.isArray(parsed) &&
            parsed.every(
              (item) =>
                typeof item === "object" &&
                item !== null &&
                typeof item.type === "string",
            )
          );
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid ABI" },
    ),
});

type AbiFormData = z.infer<typeof abiSchema>;

interface AbiDialogFormProps {
  trigger: ReactNode;
  address: Address;
}

export function AbiDialogForm({ trigger, address }: AbiDialogFormProps) {
  const { abi } = useAbi({ address });
  const isEthui = useIsEthui();

  if (!!isEthui && !!abi) {
    return <AbiViewDialog trigger={trigger} abi={abi} />;
  }

  return <AbiFormDialog trigger={trigger} address={address} abi={abi} />;
}

function AbiViewDialog({ trigger, abi }: { trigger: ReactNode; abi: Abi }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Contract ABI</DialogTitle>
          <DialogDescription>
            ABI loaded from ethui (read-only)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <span className="font-medium text-sm">ABI</span>
          <pre className="max-h-[500px] min-h-[300px] w-full overflow-auto rounded-md border bg-gray-50 p-3 font-mono text-sm">
            {JSON.stringify(abi, null, 2)}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AbiFormDialog({
  trigger,
  address,
  abi,
}: {
  trigger: ReactNode;
  address: Address;
  abi?: Abi;
}) {
  const { addOrUpdateContract, removeContract } = useContractsStore();
  const abiString = abi ? JSON.stringify(abi, null, 2) : "";

  const form = useForm<AbiFormData>({
    mode: "onChange",
    resolver: zodResolver(abiSchema),
    defaultValues: {
      abi: abiString,
    },
  });

  useEffect(() => {
    if (abi) {
      form.reset({ abi: JSON.stringify(abi, null, 2) });
    }
  }, [abi, form]);

  const handleSubmit = (data: AbiFormData) => {
    const parsedAbi = JSON.parse(data.abi) as Abi;
    addOrUpdateContract({
      address,
      abi: parsedAbi,
    });
    form.reset({ abi: JSON.stringify(parsedAbi, null, 2) });
    toast.success("Contract ABI saved");
  };

  const handleRemove = () => {
    removeContract(address);
    form.reset({ abi: "" });
    toast.success("Contract ABI removed");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Contract ABI</DialogTitle>
          <DialogDescription>
            Enter or update the ABI for this contract
          </DialogDescription>
        </DialogHeader>
        <Form form={form} onSubmit={handleSubmit} className="space-y-4">
          <Form.Textarea
            name="abi"
            label="ABI"
            placeholder="Paste the contract ABI here..."
            className="w-full font-mono text-sm [&_textarea]:min-h-[300px] [&_textarea]:resize-y"
          />
        </Form>
        <DialogFooter>
          <div className="mx-auto w-fit">
            <Button
              disabled={!abi}
              type="button"
              variant="destructive"
              onClick={handleRemove}
              className="mr-2"
            >
              Remove
            </Button>
            <Button
              disabled={!form.formState.isValid}
              type="submit"
              onClick={form.handleSubmit(handleSubmit)}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
