import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { type Address, formatEther } from "viem";
import { useBalance } from "wagmi";
import { TransactionsTable } from "#/components/Tables/TransactionsTable";
import { Tabs } from "#/components/Tabs";
import { useAddressTransactions } from "#/hooks/useAddressTransactions";
import { useIsContract } from "#/hooks/useIsContract";

import { SignatureForm } from "#/components/Forms/SignatureForm";

export const Route = createFileRoute("/rpc/$rpc/_l/address/$address")({
  loader: ({ params }) => {
    return { address: params.address as Address };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { address } = Route.useLoaderData();
  const isContract = useIsContract(address);

  return (
    <div className="flex flex-1 flex-col items-center p-10">
      <div className="flex w-full max-w-[1400px] flex-col">
        <Header address={address} isContract={isContract} />
        <Tabs
          tabs={
            [
              { label: "Transactions", component: <Transactions /> },
              { label: "Internal Transactions", component: <span /> },
              isContract && { label: "Contract", component: <Contract /> },
            ].filter(Boolean) as { label: string; component: ReactNode }[]
          }
        />
      </div>
    </div>
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
        <h3 className="pb-1 font-bold text-xl">
          {getAddressTitle(isContract)}
        </h3>
        <span className="text-sm">{address}</span>
      </span>
      <span className="text-sm">Eth balance: {formattedBalance}</span>
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
  return <SignatureForm address={address} />;
}

const getAddressTitle = (isContract: boolean | undefined) => {
  if (isContract === undefined) return "";
  return `${isContract ? "Contract" : "Address"}`;
};
