export function truncateHex(hash: string, length = 8, showEnd = true): string {
  if (!hash) return "";
  return showEnd
    ? `${hash.slice(0, length + 2)}...${hash.slice(-length)}`
    : `${hash.slice(0, length + 2)}...`;
}
