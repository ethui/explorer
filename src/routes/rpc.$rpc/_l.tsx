import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { defineChain } from "viem";
import { foundry } from "viem/chains";
import { http, WagmiProvider, webSocket } from "wagmi";
import { Topbar } from "#/components/Topbar";
import { GlobalMessage } from "#/components/GlobalMessage";
import { useChainId } from "#/hooks/useChainId";
import { useConnectionState } from "#/hooks/useConnectionState";
import { LoadingSpinner } from "#/components/LoadingSpinner";

export const Route = createFileRoute("/rpc/$rpc/_l")({
  loader: async ({ params }) => {
    return atob(params.rpc);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const rpc = Route.useLoaderData();

  const transport =
    rpc.startsWith("ws://") || rpc.startsWith("wss://")
      ? webSocket(rpc, {
          reconnect: false,
          retryCount: 1,
        })
      : http(rpc);

  const {
    data: chainId,
    isLoading: isLoadingChainId,
    error: chainIdError,
  } = useChainId(rpc, transport);

  const chain = chainId
    ? defineChain({
        ...foundry,
        id: chainId,
      })
    : foundry;

  const config = getDefaultConfig({
    appName: "Ethui Explorer",
    projectId: "ethui-explorer",
    chains: [chain],
    transports: {
      [chain.id]: transport,
    },
    ssr: true,
  });

  if (!chainId && chainIdError) {
    return (
      <>
        <Topbar showConnectButton={false} />
        <div className="flex items-center justify-center p-8">
          <GlobalMessage
            type="error"
            title="Invalid RPC"
            description={`Unable to connect to the RPC endpoint: ${rpc}. ${chainIdError.message}`}
          />
        </div>
      </>
    );
  }

  if (isLoadingChainId) {
    return (
      <>
        <Topbar showConnectButton={!!chainId} />
        <LoadingSpinner />
      </>
    );
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
        <Topbar showConnectButton={!!chainId} />
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
