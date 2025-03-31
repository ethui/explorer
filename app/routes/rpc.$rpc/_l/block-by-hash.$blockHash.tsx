import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/rpc/$rpc/_l/block-by-hash/$blockHash")({
  component: RouteComponent,
});

function RouteComponent() {
  const hash = Route.useParams().blockHash;
  return <div>{hash}</div>;
}
