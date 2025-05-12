export function truncateHex(hash: string | undefined, length = 4): string {
  return hash ? `${hash.slice(0, 2 + length)}…${hash.slice(-length)}` : "";
}
