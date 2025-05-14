import { useCallback } from "react";
import { useWatchBlockNumber } from "wagmi";
import { useConnectionStore } from "#/store/connection";

export function useConnectionState({ rpc }: { rpc: string }) {
  const { setState } = useConnectionStore();

  const onBlockNumber = useCallback(
    (b: bigint) => {
      setState({ connected: true, blockNumber: b, rpc });
    },
    [rpc, setState],
  );

  const onError = useCallback(() => {
    setState({ connected: false, blockNumber: null, rpc });
  }, [rpc, setState]);

  useWatchBlockNumber({
    emitOnBegin: true,
    emitMissed: true,
    poll: true,
    onBlockNumber,
    onError,
  });
}
