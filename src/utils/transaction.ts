import {
  type Abi,
  type AbiFunction,
  decodeFunctionData,
  getAbiItem,
} from "viem";

const inputToMethod = {
  "0x": "Transfer",
};

export function getDecodedFunctionInput({
  abi,
  input,
}: {
  abi: Abi;
  input: `0x${string}`;
}) {
  try {
    const decoded = decodeFunctionData({
      abi,
      data: input,
    });

    const abiFunction = getAbiItem({
      abi,
      name: decoded.functionName,
    }) as AbiFunction;

    return {
      functionName: decoded.functionName,
      args: decoded.args,
      abiFunction,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function getMethodName(input: string): string | null {
  return inputToMethod[input as keyof typeof inputToMethod] ?? null;
}
