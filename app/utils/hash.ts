export function truncateHex(hash: string | undefined): string {
  return hash ? `${hash.slice(0, 6)}…${hash.slice(-4)}` : "";
}
