import { useAccount } from "wagmi";

const useIsEthui = () => {
  const { connector } = useAccount();
  return connector?.id === "eth.ethui";
};

export default useIsEthui;
