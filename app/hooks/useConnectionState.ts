import { useState } from "react";
import { useConfig, useWatchBlockNumber } from "wagmi";

export function useConnectionState() {
  const [blockNumber, setBlockNumber] = useState<bigint | null>(null);
  const config = useConfig();

  const interval = blockNumber ? 10000 : 1000;

  useWatchBlockNumber({
    emitOnBegin: true,
    poll: true,
    pollingInterval: interval,
    onBlockNumber: (b) => setBlockNumber(b),
    onError: () => setBlockNumber(null),
  });

  return {
    connected: blockNumber !== null,
    blockNumber,
    rpc: config.chains[0].rpcUrls.default.http,
  };
}
