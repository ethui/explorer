import { useBytecode } from "wagmi";

export function useIsContract(address: `0x${string}` | undefined) {
  const { data, isLoading, isError } = useBytecode({
    address,
    query: { enabled: !!address },
  });

  return {
    isLoading,
    isContract: data !== null && data !== "0x",
    isError,
  };
}
