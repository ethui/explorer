import { Box as BoxIcon } from "lucide-react";
import { formatEther } from "viem";
import { useBlock } from "wagmi";
import { LinkText } from "#/components/LinkText";
import { Tooltip } from "#/components/Tooltip";
import { useBlockNumbers } from "#/hooks/useBlockNumbers";
import { truncateHex } from "#/utils/hash";
import { formatBlockTime, formatRelativeTime } from "#/utils/time";
import { CardContentItem } from "./Card";

interface LatestBlocksProps {
  rpc: string;
  latest: bigint;
  itemsToShow: number;
}

export function LatestBlocks({ rpc, latest, itemsToShow }: LatestBlocksProps) {
  const blockNumbers = useBlockNumbers(latest, itemsToShow);
  const numEmptyBlocks = Math.max(0, itemsToShow - blockNumbers.length);

  return (
    <ul>
      {blockNumbers.map((blockNumber) => (
        <Block
          key={blockNumber.toString()}
          blockNumber={blockNumber}
          rpc={rpc}
        />
      ))}
      {Array(numEmptyBlocks)
        .fill(null)
        .map((_, i) => (
          <CardContentItem key={`empty-${i}`} variant="empty" />
        ))}
    </ul>
  );
}

function Block({ blockNumber, rpc }: { blockNumber: bigint; rpc: string }) {
  const { data: block, isLoading: isBlockLoading } = useBlock({
    blockNumber,
  });
  const shouldFetchPrev = blockNumber > 0n;
  const prevBlockResult = shouldFetchPrev
    ? useBlock({ blockNumber: blockNumber - 1n })
    : { data: undefined, isLoading: false };

  if (isBlockLoading || prevBlockResult.isLoading)
    return <CardContentItem variant="loading" />;

  if (!block) return <CardContentItem variant="empty" />;

  const baseFeeBurned = block.baseFeePerGas
    ? formatEther(block.baseFeePerGas * block.gasUsed)
    : "0";

  return (
    <li className="flex flex-row gap-4 border-b py-4 last:border-b-0">
      <div className="flex w-1/3 flex-row items-center gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent">
          <BoxIcon className="h-5 w-5" />
        </div>
        <div className="flex flex-col gap-1">
          <LinkText
            to="/rpc/$rpc/block-by-hash/$blockHash"
            params={{ rpc, blockHash: block.hash }}
          >
            {blockNumber.toString()}
          </LinkText>
          <span className="text-muted-foreground text-xs">
            {formatRelativeTime(block.timestamp)}
          </span>
        </div>
      </div>
      <div className="flex w-2/3 flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <LinkText
            to="/rpc/$rpc/block-by-hash/$blockHash"
            params={{ rpc, blockHash: block.hash }}
            tooltip={block.hash}
          >
            {truncateHex(block.hash)}
          </LinkText>
          <span className="text-muted-foreground text-xs">
            <LinkText
              to="/rpc/$rpc/block-by-hash/$blockHash"
              params={{ rpc, blockHash: block.hash }}
              tooltip={"Transactions in this Block"}
            >
              {block.transactions.length} txns
            </LinkText>{" "}
            in{" "}
            {formatBlockTime(
              block.timestamp,
              prevBlockResult.data?.timestamp ?? block.timestamp,
            )}
          </span>
        </div>
        <BaseFeeBurned value={baseFeeBurned} />
      </div>
    </li>
  );
}

function BaseFeeBurned({ value }: { value: string }) {
  const formatted = (Math.round(Number(value) * 100000) / 100000).toString();

  return (
    <Tooltip content="Base fee burned">
      <div className="flex items-center rounded-lg border px-2 py-[6px]">
        <span className="block text-xs leading-none">{formatted} Eth</span>
      </div>
    </Tooltip>
  );
}
