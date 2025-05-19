import Big from "big.js";
import { Box as BoxIcon } from "lucide-react";
import { formatEther } from "viem";
import { useBlock } from "wagmi";
import { LinkText } from "#/components/LinkText";
import { Tooltip } from "#/components/Tooltip";
import { useBlockNumbers } from "#/hooks/useBlockNumbers";
import { truncateHex } from "#/utils/hash";
import { formatRelativeTime, formatTimeInterval } from "#/utils/time";
import { CardContentItem, EmptyCardContentList } from "./Card";
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
      <EmptyCardContentList numItems={numEmptyBlocks} />
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

  if (isBlockLoading) return <CardContentItem variant="loading" />;

  if (!block) return <CardContentItem variant="empty" />;

  const baseFeeBurned = block.baseFeePerGas
    ? formatEther(block.baseFeePerGas * block.gasUsed)
    : "0";

  return (
    <li className="flex flex-row gap-4 border-b py-4 last:border-b-0 lg:h-[85px]">
      <div className="flex w-1/3 flex-row items-center gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent">
          <BoxIcon className="h-5 w-5" />
        </div>
        <div className="flex flex-col gap-1">
          <LinkText
            to="/rpc/$rpc/block/$blockNumber"
            params={{ rpc, blockNumber: blockNumber.toString() }}
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
            to="/rpc/$rpc/block/$blockNumber"
            params={{ rpc, blockNumber: blockNumber.toString() }}
            tooltip={block.hash}
          >
            {truncateHex(block.hash, 11, false)}
          </LinkText>
          <span className="text-muted-foreground text-xs">
            <LinkText
              to="/rpc/$rpc/block/$blockNumber"
              params={{ rpc, blockNumber: blockNumber.toString() }}
              tooltip={"Transactions in this Block"}
            >
              {block.transactions.length} txns
            </LinkText>{" "}
            in{" "}
            {formatTimeInterval(
              prevBlockResult.data?.timestamp ?? block.timestamp,
              block.timestamp,
            )}
          </span>
        </div>
        <BaseFeeBurned value={baseFeeBurned} />
      </div>
    </li>
  );
}

function BaseFeeBurned({ value }: { value: string }) {
  const formatted = new Big(value).toFixed(5);

  return (
    <Tooltip content="Base fee burned">
      <div className="flex items-center rounded-lg border px-2 py-[6px]">
        <span className="block text-xs leading-none">{formatted} Eth</span>
      </div>
    </Tooltip>
  );
}
