const inputToMethod = {
  "0x": "Transfer",
};

export function getMethodName(input: string): string | null {
  return inputToMethod[input as keyof typeof inputToMethod] ?? null;
}
