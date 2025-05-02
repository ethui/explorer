import { useCallback } from "react";
import { useWatchBlockNumber } from "wagmi";
import { useConnectionStore } from "#/store/connection";

export function useConnectionState({ rpc }: { rpc: string }) {
  const { setState } = useConnectionStore();

  const onBlockNumber = useCallback(
    (b: bigint) => {
      console.log("onblocknumber", b);
      setState({ connected: true, blockNumber: b, rpc });
    },
    [rpc, setState],
  );

  const onError = useCallback(() => {
    setState({ connected: false, blockNumber: null, rpc });
  }, [rpc, setState]);

  useWatchBlockNumber({
    emitOnBegin: true,
    poll: true,
    pollingInterval: 1000,
    onBlockNumber,
    onError,
  });
}
