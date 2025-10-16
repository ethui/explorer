import { useQuery } from "@tanstack/react-query";
import { uniq } from "lodash-es";
import type { Address } from "viem";
import { useWalletClient } from "wagmi";
import { useConnectionStore } from "#/store/connection";
import useIsEthui from "./useIsEthui";
import { useLatestTransactions } from "./useLatestTransactions";

export interface AddressData {
  address: string;
  alias?: string;
  wallet?: string;
}

export function useLatestAddresses({
  numberOfTransactions = 20,
}: {
  numberOfTransactions?: number;
} = {}): AddressData[] {
  const { blockNumber } = useConnectionStore();
  const isEthui = useIsEthui();
  const { data: walletClient } = useWalletClient();

  const { data: transactions } = useLatestTransactions({
    latestBlock: blockNumber ?? 0n,
    numberOfTransactions,
  });

  const addresses = transactions?.flatMap(({ transaction }) =>
    [transaction.to, transaction.from].filter(Boolean),
  ) as Address[];

  const uniqueAddresses = uniq(addresses) ?? [];

  const { data: aliases } = useQuery({
    queryKey: ["address-aliases", uniqueAddresses, isEthui],
    queryFn: async () => {
      if (!walletClient || !isEthui) return {};

      const aliasPromises = uniqueAddresses.map(async (address) => {
        try {
          const alias = (await walletClient.request({
            method: "ethui_getAddressAlias",
            params: { address },
          } as any)) as string;
          return [address, alias];
        } catch {
          return [address, undefined];
        }
      });

      const results = await Promise.all(aliasPromises);
      return Object.fromEntries(results);
    },
    enabled: isEthui && !!walletClient && uniqueAddresses.length > 0,
  });

  const addressData = uniqueAddresses.map((address) => ({
    address,
    alias: aliases?.[address],
  }));

  return addressData;
}
