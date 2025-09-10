import { useQuery } from "@tanstack/react-query";
import { type Transport, createPublicClient } from "viem";

export function useChainId(rpc: string, transport: Transport) {
  return useQuery({
    queryKey: ["chainId", rpc],
    queryFn: async () => {
      const client = createPublicClient({
        transport,
      });

      const chainId = await client.getChainId();
      return chainId;
    },
    enabled: !!rpc && !!transport,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
