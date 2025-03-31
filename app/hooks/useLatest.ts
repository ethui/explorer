import { useEffect, useState } from "react";
import { useBlockNumber, useWatchBlockNumber } from "wagmi";

export function useLatest() {
  const { data: blockNumber } = useBlockNumber();
  const [latest, setLatest] = useState<bigint | null>(null);

  // emitOnBegin does not seem to work with websockets
  useEffect(() => {
    blockNumber && setLatest(blockNumber);
  }, [blockNumber]);

  useWatchBlockNumber({
    emitOnBegin: true,
    emitMissed: true,
    onBlockNumber: (b) => {
      console.log("b", b);
      setLatest(b);
    },
    onError: (e) => {
      console.log("e", e);
      setLatest(null);
    },
  });

  return latest;
}
