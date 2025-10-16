import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { isAddress, isHash } from "viem";
import { z } from "zod";
import { isBlockNumber } from "#/utils/validators";

const searchSchema = z.object({
  q: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => String(val || "")),
});

export const Route = createFileRoute("/rpc/$rpc/search")({
  validateSearch: (search) => searchSchema.parse(search),
  beforeLoad: ({ search, params }) => {
    const { q: searchTerm } = search;

    if (!searchTerm) {
      throw redirect({
        to: "/rpc/$rpc",
        params: { rpc: params.rpc },
      });
    }

    if (isAddress(searchTerm)) {
      throw redirect({
        to: "/rpc/$rpc/address/$address",
        params: { rpc: params.rpc, address: searchTerm },
      });
    } else if (isBlockNumber(searchTerm)) {
      throw redirect({
        to: "/rpc/$rpc/block/$blockNumber",
        params: { rpc: params.rpc, blockNumber: searchTerm },
      });
    } else if (isHash(searchTerm)) {
      throw redirect({
        to: "/rpc/$rpc/tx/$tx",
        params: { rpc: params.rpc, tx: searchTerm },
      });
    } else {
      throw notFound;
    }
  },
  component: () => null,
});
