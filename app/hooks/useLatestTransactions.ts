import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getBlock } from "@wagmi/core";
import type { Transaction } from "viem";
import { type Config, useConfig } from "wagmi";

type UseLatestTransactionsParams = {
  latestBlock: bigint;
  numberOfTransactions: number;
  batchSize?: number;
  maxLookback?: number;
};

type LatestTransactions = {
  config: ReturnType<typeof useConfig>;
  latestBlock: bigint;
  numberOfTransactions: number;
  batchSize: number;
  maxLookback: number;
};

export function useLatestTransactions({
  latestBlock,
  numberOfTransactions,
  batchSize = 5,
  maxLookback = 1000,
}: UseLatestTransactionsParams) {
  const config = useConfig();

  return useQuery({
    queryKey: [
      "latest-transactions",
      latestBlock.toString(),
      numberOfTransactions,
      batchSize,
      maxLookback,
    ],
    enabled: !!config && !!latestBlock,
    queryFn: async () =>
      fetchLatestTransactions({
        config,
        latestBlock,
        numberOfTransactions,
        batchSize,
        maxLookback,
      }),
    placeholderData: keepPreviousData,
  });
}

async function fetchLatestTransactions({
  config,
  latestBlock,
  numberOfTransactions,
  batchSize,
  maxLookback,
}: LatestTransactions) {
  const transactions = [];
  let currBlock = latestBlock;
  let blocksScanned = 0;

  while (
    transactions.length < numberOfTransactions &&
    currBlock > 0n &&
    blocksScanned < maxLookback
  ) {
    const batch = getBatchBlockNumbers(currBlock, batchSize);
    const blocks = await fetchBlockBatch(config, batch);

    const extracted = extractTransactionsFromBlocks(
      blocks,
      numberOfTransactions - transactions.length,
    );
    transactions.push(...extracted);

    blocksScanned += blocks.length;
    currBlock -= BigInt(batchSize);
  }

  return transactions;
}

function extractTransactionsFromBlocks(
  blocks: { transactions: Transaction[]; timestamp: bigint }[],
  limit: number,
) {
  const collected = [];

  for (const block of blocks) {
    for (const tx of block.transactions) {
      collected.push({ transaction: tx, timestamp: block.timestamp });
      if (collected.length >= limit) return collected;
    }
  }

  return collected;
}

function getBatchBlockNumbers(fromBlock: bigint, size: number) {
  return Array.from({ length: size }, (_, i) => fromBlock - BigInt(i)).filter(
    (n) => n >= 0n,
  );
}

async function fetchBlockBatch(config: Config, numbers: bigint[]) {
  const blocks = await Promise.all(
    numbers.map((blockNumber) =>
      getBlock(config, {
        blockNumber,
        includeTransactions: true,
      }),
    ),
  );

  return blocks;
}
