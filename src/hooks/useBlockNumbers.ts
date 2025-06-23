import { useEffect, useState } from "react";
import { useBlock } from "wagmi";

export function useBlockNumbers(latest: bigint, itemsToShow: number) {
  const { data: block } = useBlock({ blockNumber: latest });
  const [blockNumbers, setBlockNumbers] = useState<bigint[]>([]);

  useEffect(() => {
    if (!block?.number) return;

    const newNumbers = [...Array(itemsToShow).keys()]
      .map((i) => block.number - BigInt(i))
      .filter((n) => n >= 0n);

    setBlockNumbers(newNumbers);
  }, [block?.number, itemsToShow]);

  return blockNumbers;
}
