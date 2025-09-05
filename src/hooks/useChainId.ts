import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http, webSocket } from "viem";

export function useChainId(rpc: string) {
  return useQuery({
    queryKey: ["chainId", rpc],
    queryFn: async () => {
      const transport =
        rpc.startsWith("ws://") || rpc.startsWith("wss://")
          ? webSocket(rpc)
          : http(rpc);

      const client = createPublicClient({
        transport,
      });

      const chainId = await client.getChainId();
      return chainId;
    },
    enabled: !!rpc,
  });
}
