import Big from "big.js";
import { formatEther } from "viem";

const inputToMethod = {
  "0x": "Transfer",
};

export function formatEth(value: string | bigint, decimals = 8): string {
  const wei = typeof value === "string" ? BigInt(value) : value;
  return Big(formatEther(wei))
    .toFixed(decimals)
    .replace(/\.?0+$/, "");
}

export function formatInput(input: string): string | null {
  return inputToMethod[input as keyof typeof inputToMethod] ?? null;
}
