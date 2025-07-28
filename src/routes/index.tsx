import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { http, createPublicClient } from "viem";
import { Topbar } from "#/components/Topbar";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    async function testConnection() {
      const client = createPublicClient({
        transport: http("http://localhost:8545", { timeout: 3000 }),
      });

      try {
        const result = await client.getChainId();
        if (result) {
          const rpcUrl = "ws://localhost:8545";
          const encodedRpc = btoa(rpcUrl);

          (navigate as any)({
            to: "/rpc/$rpc",
            params: { rpc: encodedRpc },
            replace: true,
          });
          return;
        }
      } catch (error) {
        console.error("Connection failed:", error);
      }
      setIsConnecting(false);
    }

    testConnection();
  }, [navigate]);

  if (isConnecting) return null;
  return <Topbar />;
}
