import { createFileRoute } from "@tanstack/react-router";
import { useBlock } from "wagmi";
import { LinkText } from "#/components/LinkText";
import LoadingSpinner from "#/components/LoadingSpinner";
import PageContainer from "#/components/PageContainer";
import { TransactionsTable } from "#/components/Tables/TransactionsTable";

export const Route = createFileRoute("/rpc/$rpc/_l/block/$blockNumber")({
  component: RouteComponent,
});

function RouteComponent() {
  const { blockNumber } = Route.useParams();
  const { data: block, isLoading } = useBlock({
    blockNumber: BigInt(blockNumber),
    includeTransactions: true,
  });

  const transactions = block?.transactions;

  if (isLoading) return <LoadingSpinner />;
  if (!transactions) return <div>Block not found</div>;

  return (
    <PageContainer header="Transactions">
      <span className="pb-8 text-sm">
        For Block{" "}
        <LinkText to="/rpc/$rpc/block/$blockNumber" params={{ blockNumber }}>
          {blockNumber}
        </LinkText>
      </span>

      <TransactionsTable transactions={transactions} />
    </PageContainer>
  );
}
