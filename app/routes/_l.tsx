import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_l")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_l"!</div>;
}
