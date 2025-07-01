import Big from "big.js";
import { formatEther } from "viem";

export function formatEth(value: string | bigint, decimals = 8): string {
  const wei = typeof value === "string" ? BigInt(value) : value;
  return Big(formatEther(wei))
    .toFixed(decimals)
    .replace(/\.?0+$/, "");
}
