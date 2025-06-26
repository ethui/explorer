import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ethui/ui/components/shadcn/dialog";
import { Button } from "@ethui/ui/components/shadcn/button";
import { Form } from "@ethui/ui/components/form";
import type { ReactNode } from "react";
import { useContractsStore } from "#/store/contracts";
import { type Address, type Abi } from "viem";
import toast from "react-hot-toast";

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
  const { addOrUpdateContract, getContract, removeContract } =
    useContractsStore();
  const existingContract = getContract(address);
  const form = useForm<AbiFormData>({
    mode: "onChange",
    resolver: zodResolver(abiSchema),
    defaultValues: {
      abi: existingContract
        ? JSON.stringify(existingContract.abi, null, 2)
        : "",
    },
  });

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
            {existingContract && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemove}
                className="mr-2"
              >
                Remove
              </Button>
            )}
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
