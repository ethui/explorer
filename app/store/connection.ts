import { create } from "zustand";

interface ConnectionState {
  connected: boolean | undefined;
  blockNumber: bigint | null;
  rpc: string | undefined;
  setState: (state: Partial<ConnectionState>) => void;
  reset: () => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  connected: undefined,
  blockNumber: null,
  rpc: undefined,
  setState: (state) => set(state),
  reset: () => set({ connected: undefined, blockNumber: null, rpc: undefined }),
}));
