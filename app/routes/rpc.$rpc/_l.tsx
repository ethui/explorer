import { Outlet, createFileRoute } from "@tanstack/react-router";
import { http, WagmiProvider, createConfig, webSocket } from "wagmi";
import { foundry } from "wagmi/chains";
import { LoadingSpinner } from "#/components/LoadingSpinner";
import { useConnectionState } from "#/hooks/useConnectionState";

export const Route = createFileRoute("/rpc/$rpc/_l")({
  loader: async ({ params }) => {
    return decodeURIComponent(params.rpc);
  },
  component: RouteComponent,
  pendingComponent: () => <LoadingSpinner />,
});

function RouteComponent() {
  const rpc = Route.useLoaderData();

  const transport =
    rpc.startsWith("ws://") || rpc.startsWith("wss://")
      ? webSocket(rpc)
      : http(rpc);

  const wagmi = createConfig({
    chains: [foundry],
    transports: {
      [foundry.id]: transport,
    },
  });

  return (
    <WagmiProvider reconnectOnMount key={rpc} config={wagmi}>
      <ConnectionStateUpdater rpc={rpc} />
      <div className="flex flex-col justify-center gap-2">
        <div className="flex-grow overflow-hidden">
          <Outlet />
        </div>
      </div>
    </WagmiProvider>
  );
}

function ConnectionStateUpdater({ rpc }: { rpc: string }) {
  useConnectionState({ rpc });
  return null;
}
