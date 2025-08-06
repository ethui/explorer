import { createFileRoute, redirect } from "@tanstack/react-router";
import { isAddress, isHash } from "viem";
import { z } from "zod";
import { isBlockNumber } from "#/utils/validators";

const searchSchema = z.object({
  q: z
    .string()
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

    const basePath = `/rpc/${params.rpc}`;

    if (isAddress(searchTerm)) {
      throw redirect({
        to: `${basePath}/address/${searchTerm}`,
      });
    } else if (isBlockNumber(searchTerm)) {
      throw redirect({
        to: `${basePath}/block/${searchTerm}`,
      });
    } else if (isHash(searchTerm)) {
      throw redirect({
        to: `${basePath}/tx/${searchTerm}`,
      });
    } else {
      throw redirect({
        to: `${basePath}/not-found`,
      });
    }
  },
  component: () => null,
});
