import type { Address, Client, Transaction, TransactionReceipt } from "viem";

export type TransactionResponse = {
  txs: Transaction[];
  receipts: TransactionReceipt[];
  firstPage: boolean;
  lastPage: boolean;
};

export type AnvilClient = Client & {
  request: Client["request"] &
    ((args: {
      method: "ots_searchTransactionsAfter" | "ots_searchTransactionsBefore";
      params: [Address, number, number];
    }) => Promise<TransactionResponse>);
};
