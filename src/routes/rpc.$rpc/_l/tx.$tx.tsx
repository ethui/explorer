import { createFileRoute } from "@tanstack/react-router";
import { type Hash, isHash } from "viem";
import { useTransaction } from "wagmi";
import PageContainer from "#/components/PageContainer";

export const Route = createFileRoute("/rpc/$rpc/_l/tx/$tx")({
  component: RouteComponent,
  loader: ({ params }) => {
    if (!isHash(params.tx)) {
      throw new Error("The transaction hash is not valid");
    }
    return { tx: params.tx as Hash };
  },
});

function RouteComponent() {
  const { tx } = Route.useLoaderData();
  const { data: transaction } = useTransaction({
    hash: tx,
  });

  return (
    <PageContainer header="Transaction Details">
      {JSON.stringify(
        transaction,
        (_key, value) => (typeof value === "bigint" ? value.toString() : value),
        2,
      )}
    </PageContainer>
  );
}
