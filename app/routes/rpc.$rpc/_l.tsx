import { Outlet, createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { http, WagmiProvider, createConfig, webSocket } from "wagmi";
import { foundry } from "wagmi/chains";
import { LoadingSpinner } from "#/components/LoadingSpinner";
import { useConnectionState } from "#/hooks/useConnectionState";
import { validateRpcConnection } from "#/utils/rpc";

const validateRpc = createServerFn({
  method: "GET",
})
  .validator((rpc: string) => rpc)
  .handler(async ({ data: rpc }) => validateRpcConnection(rpc));

export const Route = createFileRoute("/rpc/$rpc/_l")({
  loader: async ({ params }) => {
    const rpc = decodeURIComponent(params.rpc);
    return validateRpc({ data: rpc });
  },
  component: RouteComponent,
  pendingComponent: () => <LoadingSpinner />,
});

function RouteComponent() {
  const rpc = Route.useLoaderData();
  const transport = rpc.startsWith("ws://") ? webSocket(rpc) : http(rpc);

  const wagmi = createConfig({
    chains: [foundry],
    transports: {
      [foundry.id]: transport,
    },
  });

  return (
    <WagmiProvider key={rpc} config={wagmi}>
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
