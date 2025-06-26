import { Abi, Address } from "viem";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Contract = {
  address: Address;
  abi: Abi;
};

type ContractsState = {
  contracts: Record<Address, Contract>;
  getContract: (address: Address) => Contract | undefined;
  getAllContracts: () => Contract[];
  setContracts: (contracts: Record<Address, Contract>) => void;
  addOrUpdateContract: (contract: Contract) => void;
  removeContract: (address: Address) => void;
};

export const useContractsStore = create<ContractsState>()(
  persist(
    (set, get) => ({
      contracts: {},
      getContract: (address: Address) => get().contracts[address],
      getAllContracts: () => Object.values(get().contracts),
      setContracts: (contracts: Record<Address, Contract>) =>
        set({ contracts }),

      addOrUpdateContract: (contract: Contract) =>
        set((state) => ({
          contracts: { ...state.contracts, [contract.address]: contract },
        })),
      removeContract: (address: Address) =>
        set((state) => {
          const { [address]: removed, ...rest } = state.contracts;
          return { contracts: rest };
        }),
    }),
    {
      name: "contracts",
    },
  ),
);
