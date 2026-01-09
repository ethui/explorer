import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useConnectionStore } from "#/store/connection";
import { trackPageView } from "#/utils/analytics";
import { Card } from "../-components/Card";
import { LatestBlocks } from "../-components/LatestBlocks";
import { LatestTransactions } from "../-components/LatestTransactions";

const ITEMS_TO_SHOW = 6;

export const Route = createFileRoute("/rpc/$rpc/_l/")({
  component: RouteComponent,
});

function RouteComponent() {
  const rpc = Route.useParams().rpc;
  const { blockNumber } = useConnectionStore();

  useEffect(() => {
    trackPageView("rpc_dashboard");
  }, []);

  if (blockNumber === null) return null;

  return (
    <div className="flex flex-1 items-center justify-center p-10">
      <div className="grid w-full max-w-[1400px] grid-cols-1 gap-4 xl:grid-cols-2">
        <Card
          title="Latest Blocks"
          // footerLink={{
          //   text: "VIEW ALL BLOCKS",
          //   to: "/rpc/$rpc/blocks",
          // }}
        >
          <LatestBlocks
            rpc={rpc}
            latest={blockNumber}
            itemsToShow={ITEMS_TO_SHOW}
          />
        </Card>
        <Card
          title="Latest Transactions"
          // footerLink={{
          //   text: "VIEW ALL TRANSACTIONS",
          //   to: "/rpc/$rpc/transactions",
          // }}
        >
          <LatestTransactions
            latestBlock={blockNumber}
            numberOfTransactions={ITEMS_TO_SHOW}
          />
        </Card>
      </div>
    </div>
  );
}
