import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { type Address, isAddress } from "viem";
import { TransactionsTable } from "#/components/Tables/TransactionsTable";
import { Tabs } from "#/components/Tabs";
import { useAddressTransactions } from "#/hooks/useAddressTransactions";
import { useIsContract } from "#/hooks/useIsContract";

import PageContainer from "#/components/PageContainer";

import { z } from "zod";
import { LoadingSpinner } from "#/components/LoadingSpinner";
import { ContractTab } from "./-components/ContractTab";
import { Header } from "./-components/Header";

const searchSchema = z.object({
  callData: z.string().optional(),
});

export const Route = createFileRoute("/rpc/$rpc/_l/address/$address/")({
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
            isContract && {
              label: "Contract",
              component: <ContractTab address={address} />,
            },
          ].filter(Boolean) as { label: string; component: ReactNode }[]
        }
      />
    </PageContainer>
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
