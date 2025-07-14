import { createFileRoute } from "@tanstack/react-router";
import { Edit, FileCode } from "lucide-react";
import type { ReactNode } from "react";
import { type Address, formatEther, isAddress } from "viem";
import { useBalance } from "wagmi";
import { TransactionsTable } from "#/components/Tables/TransactionsTable";
import { Tabs } from "#/components/Tabs";
import { useAddressTransactions } from "#/hooks/useAddressTransactions";
import { useIsContract } from "#/hooks/useIsContract";

import { Button } from "@ethui/ui/components/shadcn/button";

import { AbiDialogForm } from "#/components/Forms/AbiDialogForm";
import { ContractInteractionForm } from "#/components/Forms/ContractInteractionForm";
import PageContainer from "#/components/PageContainer";

import { z } from "zod";
import { LoadingSpinner } from "#/components/LoadingSpinner";

const searchSchema = z.object({
  callData: z.string().optional(),
});

export const Route = createFileRoute("/rpc/$rpc/_l/address/$address")({
  loader: ({ params }) => {
    if (!isAddress(params.address)) {
      throw new Error("The address is not valid");
    }

    return { address: params.address as Address };
  },
  validateSearch: (search) => searchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  const { callData } = Route.useSearch();
  const { address } = Route.useLoaderData();

  const { isContract, isLoading: isContractLoading } = useIsContract(address);

  if (isContractLoading) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer
      header={<Header address={address} isContract={isContract} />}
    >
      <Tabs
        tabs={
          [
            { label: "Transactions", component: <Transactions /> },
            isContract && { label: "Contract", component: <Contract /> },
          ].filter(Boolean) as { label: string; component: ReactNode }[]
        }
        tabIndex={callData && isContract ? 1 : 0}
      />
    </PageContainer>
  );
}

function Header({
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

function Transactions() {
  const { address } = Route.useLoaderData();
  const { data } = useAddressTransactions({
    address,
    blockNumber: 0n,
  });

  return <TransactionsTable transactions={data?.txs ?? []} />;
}

function Contract() {
  const { address } = Route.useLoaderData();
  const { callData } = Route.useSearch();
  return <ContractInteractionForm address={address} callData={callData} />;
}

const getAddressTitle = (isContract: boolean | undefined) => {
  if (isContract === undefined) return "";
  return `${isContract ? "Contract" : "Address"}`;
};
