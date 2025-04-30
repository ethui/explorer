import { Outlet, createFileRoute, useLoaderData } from "@tanstack/react-router";
import { createPublicClient } from "viem";
import { http, WagmiProvider, createConfig, webSocket } from "wagmi";
import { foundry } from "wagmi/chains";
import { LoadingSpinner } from "#/components/LoadingSpinner";

export const Route = createFileRoute("/rpc/$rpc/_l")({
  loader: async ({ params }) => {
    const rpc = decodeURIComponent(params.rpc);

    if (rpc.startsWith("ws")) {
      const isValid = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => resolve(false), 5000);
        try {
          const ws = new WebSocket(rpc);
          ws.onopen = () => {
            clearTimeout(timeout);
            ws.close();
            resolve(true);
          };
          ws.onerror = () => {
            clearTimeout(timeout);
            resolve(false);
          };
        } catch {
          clearTimeout(timeout);
          resolve(false);
        }
      });

      if (!isValid) {
        throw new Error(`Invalid WebSocket RPC on ${rpc}`);
      }
    } else {
      try {
        const client = createPublicClient({
          chain: foundry,
          transport: http(rpc),
        });
        await client.getChainId();
      } catch (_err) {
        throw new Error(`Invalid RPC on ${rpc}`);
      }
    }

    return rpc;
  },
  component: RouteComponent,
  pendingComponent: () => <LoadingSpinner />,
});

function RouteComponent() {
  const rpc = useLoaderData({ from: Route.id });

  const transport = rpc.startsWith("ws://") ? webSocket(rpc) : http(rpc);
  const wagmi = createConfig({
    chains: [foundry],
    transports: {
      [foundry.id]: transport,
    },
  });

  return (
    <WagmiProvider config={wagmi}>
      <div className="flex flex-col justify-center gap-2">
        <div className="flex-grow overflow-hidden">
          <Outlet />
        </div>
      </div>
    </WagmiProvider>
  );
}
