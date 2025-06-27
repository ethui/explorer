import type { Address } from "viem";
import { useContractsStore } from "#/store/contracts";
import useEthuiAbi from "./useEthuiAbi";

const useAbi = ({ address }: { address: Address }) => {
  const { data: ethuiAbi } = useEthuiAbi({ address });
  const { getContract } = useContractsStore();
  const contract = getContract(address);

  return {
    abi: ethuiAbi || contract?.abi,
    isEthuiAbi: !!ethuiAbi,
  };
};

export default useAbi;
