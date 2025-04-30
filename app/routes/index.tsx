import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: () => {
    throw redirect({
      to: "/rpc/$rpc",
      params: { rpc: encodeURIComponent("ws://localhost:8545") },
    });
  },
});
