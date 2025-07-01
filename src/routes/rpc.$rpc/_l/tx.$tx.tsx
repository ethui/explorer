import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/rpc/$rpc/_l/tx/$tx")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/rpc/$rpc/_l/tx/$tx"!</div>;
}
