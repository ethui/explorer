import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";

import { useWalletClient } from "wagmi";
import useIsEthui from "./useIsEthui";

const useAddressAlias = ({ address }: { address: Address }) => {
  const isEthui = useIsEthui();
  const { data: walletClient } = useWalletClient();

  return useQuery({
    queryKey: ["address-alias", address, isEthui],
    queryFn: async () => {
      const alias = (await walletClient?.request({
        method: "ethui_getAddressAlias",
        params: { address },
      } as any)) as string;

      return alias;
    },
    enabled: isEthui && !!walletClient,
  });
};

export default useAddressAlias;
