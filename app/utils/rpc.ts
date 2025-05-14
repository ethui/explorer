import { createPublicClient, http, webSocket } from "viem";
import { foundry } from "wagmi/chains";

export async function validateRpcConnection(rpc: string): Promise<string> {
  const isWs = rpc.startsWith("ws://") || rpc.startsWith("wss://");

  try {
    const transport = isWs ? webSocket(rpc) : http(rpc);
    const client = createPublicClient({
      chain: foundry,
      transport,
    });

    await client.getChainId();
  } catch {
    throw new Error(`Invalid RPC on ${rpc}`);
  }

  return rpc;
}
