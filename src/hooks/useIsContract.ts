import { useBytecode } from "wagmi";

export function useIsContract(address: `0x${string}` | undefined) {
  const result = useBytecode({ address });
  if (result.data === undefined) return undefined;
  return result.data !== null && result.data !== "0x";
}
