import Big from "big.js";
import { formatEther } from "viem";

export function formatEth(
  value: string | bigint,
  decimals: number | undefined = 8,
): string {
  const wei = typeof value === "string" ? BigInt(value) : value;
  return Big(formatEther(wei))
    .toFixed(decimals)
    .replace(/\.?0+$/, "");
}

export const stringifyWithBigInt = (value: unknown): string =>
  JSON.stringify(
    value,
    (_, v) => (typeof v === "bigint" ? v.toString() : v),
    2,
  );
