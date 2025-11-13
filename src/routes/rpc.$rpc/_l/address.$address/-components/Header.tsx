import { Button } from "@ethui/ui/components/shadcn/button";
import { FileCode } from "lucide-react";
import { Edit } from "lucide-react";
import { formatEther } from "viem";
import type { Address } from "viem";
import { useBalance } from "wagmi";
import { AbiDialogForm } from "#/components/Forms/AbiDialogForm";

export function Header({
  address,
  isContract,
}: {
  address: Address;
  isContract: boolean | undefined;
}) {
  const { data: balance } = useBalance({ address });
  const formattedBalance = formatEther(balance?.value ?? 0n);
  return (
    <div>
      <span className="flex flex-row items-center gap-2">
        {isContract && <FileCode className="mb-1 h-5 w-5" />}
        <h3 className="pb-1 font-bold text-xl">
          {getAddressTitle(isContract)}
        </h3>
        <span className="font-normal text-sm">{address}</span>
        {isContract && (
          <AbiDialogForm
            address={address}
            trigger={
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Edit className="h-4 w-4" />
              </Button>
            }
          />
        )}
      </span>
      <span className="font-normal text-sm">
        Eth balance: {formattedBalance}
      </span>
    </div>
  );
}

const getAddressTitle = (isContract: boolean | undefined) => {
  if (isContract === undefined) return "";
  return `${isContract ? "Contract" : "Address"}`;
};
