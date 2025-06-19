import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { useClient } from "wagmi";
import type { AnvilClient } from "../types/anvil";

type searchType = "after" | "before";

interface SearchTransactionsAfterParams {
  address: Address;
  blockNumber: bigint;
  searchType?: searchType;
  pageSize?: number;
}

export function useAddressTransactions({
  address,
  blockNumber,
  searchType = "after",
  pageSize = 1000,
}: SearchTransactionsAfterParams) {
  const client = useClient() as AnvilClient;

  return useQuery({
    queryKey: [
      "address-transactions",
      address,
      blockNumber.toString(),
      searchType,
    ],
    queryFn: async () => {
      if (!client) return null;

      const method =
        searchType === "after"
          ? "ots_searchTransactionsAfter"
          : "ots_searchTransactionsBefore";

      return client.request({
        method,
        params: [address, Number(blockNumber), pageSize],
      });
    },
  });
}
