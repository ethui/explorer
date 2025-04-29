import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <Link
      to="/rpc/$rpc"
      params={{ rpc: encodeURIComponent("ws://localhost:8545") }}
    >
      Go
    </Link>
  );
}
