import { http, createPublicClient } from "viem";
import { foundry } from "wagmi/chains";

export async function validateRpcConnection(rpc: string): Promise<string> {
  if (rpc.startsWith("ws://")) {
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
}
