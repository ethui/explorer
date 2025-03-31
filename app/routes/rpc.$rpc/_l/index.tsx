import { createFileRoute, Link } from "@tanstack/react-router";
import { useBlock, useBlockNumber, useWatchBlockNumber } from "wagmi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@ethui/ui/components/shadcn/card";
import { useLatest } from "#/hooks/useLatest";

export const Route = createFileRoute("/rpc/$rpc/_l/")({
  loader: ({ params }) => decodeURIComponent(params.rpc),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid md:grid-cols-2">
      <LatestBlocks />
      <LatestTxs />
    </div>
  );
}

function LatestBlocks() {
  const latest = useLatest();

  if (!latest) {
    return <Card>Loading...</Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Blocks</CardTitle>
      </CardHeader>
      <CardContent>
        {[...Array(10).keys()].map((b) => {
          if (latest - BigInt(b) >= 0n) {
            return <Block key={b} blockNumber={latest - BigInt(b)} />;
          }
        })}
      </CardContent>
    </Card>
  );
}

function LatestTxs() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Transactions</CardTitle>
      </CardHeader>
      <CardContent>foo</CardContent>
    </Card>
  );
}

function Block({ blockNumber }: { blockNumber: bigint }) {
  const rpc = Route.useParams().rpc;
  console.log(rpc);
  const { data: block } = useBlock({ blockNumber });

  if (!block) return null;

  return (
    <Link
      className="flex gap-2"
      to="/rpc/$rpc/block-by-hash/$blockHash"
      params={{ rpc, blockHash: block?.hash }}
    >
      <span className="font-bold">{blockNumber}</span>
      <span>{truncateHex(block?.hash)}</span>
    </Link>
  );
}

export function truncateHex(hash: string | undefined): string {
  return hash && `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}
