import { createFileRoute } from "@tanstack/react-router";
import { useLatest } from "#/hooks/useLatest";
import { Card } from "../-components/Card";
import { LatestBlocks } from "../-components/LatestBlocks";
import { LatestTransactions } from "../-components/LatestTransactions";

const ITEMS_TO_SHOW = 6;

export const Route = createFileRoute("/rpc/$rpc/_l/")({
  component: RouteComponent,
});

function RouteComponent() {
  const rpc = Route.useParams().rpc;
  const latest = useLatest();

  if (latest === null) return null;

  return (
    <div className="flex flex-1 items-center justify-center p-10">
      <div className="grid w-full max-w-[1800px] grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          title="Latest Blocks"
          footerLink={{
            text: "VIEW ALL BLOCKS",
            to: "/rpc/$rpc/blocks",
          }}
        >
          <LatestBlocks rpc={rpc} latest={latest} itemsToShow={ITEMS_TO_SHOW} />
        </Card>
        <Card
          title="Latest Transactions"
          footerLink={{
            text: "VIEW ALL TRANSACTIONS",
            to: "/rpc/$rpc/transactions",
          }}
        >
          <LatestTransactions
            latestBlock={latest}
            numberOfTransactions={ITEMS_TO_SHOW}
          />
        </Card>
      </div>
    </div>
  );
}
