import { Box as BoxIcon } from "lucide-react";
import { formatEther } from "viem";
import { useBlock } from "wagmi";
import { LinkText } from "#/components/LinkText";
import { Tooltip } from "#/components/Tooltip";
import { truncateHex } from "#/utils/hash";
import { formatBlockTime, formatRelativeTime } from "#/utils/time";

interface LatestBlocksProps {
  rpc: string;
  latest: bigint | null;
  itemsToShow: number;
}

export function LatestBlocks({ rpc, latest, itemsToShow }: LatestBlocksProps) {
  if (!latest) return null;

  const blockNumbers = [...Array(itemsToShow).keys()]
    .map((b) => latest - BigInt(b))
    .filter((n) => n >= 0n);

  return (
    <ul>
      {blockNumbers.map((blockNumber) => (
        <Block
          key={blockNumber.toString()}
          blockNumber={blockNumber}
          rpc={rpc}
        />
      ))}
    </ul>
  );
}

function Block({ blockNumber, rpc }: { blockNumber: bigint; rpc: string }) {
  const { data: block } = useBlock({ blockNumber });
  const { data: prevBlock } = useBlock({ blockNumber: blockNumber - 1n });

  if (!block) return null;

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
            in {formatBlockTime(block.timestamp, prevBlock?.timestamp)}
          </span>
        </div>
        <BaseFeeBurned value={baseFeeBurned} />
      </div>
    </li>
  );
}

function BaseFeeBurned({ value }: { value: string }) {
  return (
    <Tooltip content="Base fee burned">
      <div className="flex items-center rounded-lg border px-2 py-[6px]">
        <span className="block text-xs leading-none">{value} Eth</span>
      </div>
    </Tooltip>
  );
}
