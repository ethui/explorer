import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { http, WagmiProvider, webSocket } from "wagmi";
import { Topbar } from "#/components/Topbar";
import { useConnectionState } from "#/hooks/useConnectionState";
import { useChainId } from "#/hooks/useChainId";
import { defineChain } from "viem";
import { foundry } from "viem/chains";

export const Route = createFileRoute("/rpc/$rpc/_l")({
  loader: async ({ params }) => {
    return atob(params.rpc);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const rpc = Route.useLoaderData();
  const { data: chainId, isLoading: isLoadingChainId } = useChainId(rpc);

  const transport =
    rpc.startsWith("ws://") || rpc.startsWith("wss://")
      ? webSocket(rpc)
      : http(rpc);

  const chain = useMemo(() => {
    return chainId
      ? defineChain({
          ...foundry,
          id: chainId,
        })
      : foundry;
  }, [chainId]);

  const config = useMemo(
    () =>
      getDefaultConfig({
        appName: "Ethui Explorer",
        projectId: "ethui-explorer",
        chains: [chain],
        transports: {
          [chain.id]: transport,
        },
        ssr: true,
      }),
    [chain, transport],
  );

  if (isLoadingChainId) {
    return null;
  }
  return (
    <WagmiProvider key={rpc} config={config}>
      <RainbowKitProvider
        theme={darkTheme({
          accentColor: "#000000",
          accentColorForeground: "white",
          borderRadius: "medium",
        })}
        initialChain={chain}
      >
        <Topbar showConnectButton />
        <ConnectionStateUpdater rpc={rpc} />
        <div className="flex flex-col justify-center gap-2">
          <div className="flex-grow overflow-hidden">
            <Outlet />
          </div>
        </div>
      </RainbowKitProvider>
    </WagmiProvider>
  );
}

function ConnectionStateUpdater({ rpc }: { rpc: string }) {
  useConnectionState({ rpc });
  return null;
}
