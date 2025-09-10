import { useCallback, useEffect } from "react";
import { useWatchBlockNumber } from "wagmi";
import { useConnectionStore } from "../store/connection";

export function useConnectionState({ rpc }: { rpc: string }) {
  const { setState, reset } = useConnectionStore();

  useEffect(() => {
    reset();
    setState({ rpc });
  }, [rpc, setState, reset]);

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
    pollingInterval: 1000,
    enabled: true, // Will be handled by wagmi's error handling
    onBlockNumber,
    onError,
  });
}
