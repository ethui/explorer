import { useQuery } from "@tanstack/react-query";
import type { Abi, Address } from "viem";

import { useWalletClient } from "wagmi";
import useIsEthui from "./useIsEthui";

const useEthuiAbi = ({ address }: { address: Address }) => {
  const isEthui = useIsEthui();
  const { data: walletClient } = useWalletClient();

  return useQuery({
    queryKey: ["abi", address],
    queryFn: async () => {
      const abi = (await walletClient?.request({
        method: "ethui_getContractAbi",
        params: { address },
      } as any)) as Abi;

      return abi;
    },
    enabled: isEthui && !!walletClient,
  });
};

export default useEthuiAbi;
