import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { http, WagmiProvider, webSocket } from "wagmi";
import { foundry } from "wagmi/chains";
import { Topbar } from "#/components/Topbar";
import { useConnectionState } from "#/hooks/useConnectionState";

export const Route = createFileRoute("/rpc/$rpc/_l")({
  loader: async ({ params }) => {
    return decodeURIComponent(params.rpc);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const rpc = Route.useLoaderData();

  const transport =
    rpc.startsWith("ws://") || rpc.startsWith("wss://")
      ? webSocket(rpc)
      : http(rpc);

  const config = getDefaultConfig({
    appName: "Ethui Explorer",
    projectId: "ethui-explorer",
    chains: [foundry],
    transports: {
      [foundry.id]: transport,
    },
    ssr: true,
  });

  return (
    <WagmiProvider reconnectOnMount key={rpc} config={config}>
      <RainbowKitProvider
        theme={darkTheme({
          accentColor: "#000000",
          accentColorForeground: "white",
          borderRadius: "medium",
        })}
        initialChain={foundry}
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
