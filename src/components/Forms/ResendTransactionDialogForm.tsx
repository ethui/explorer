import { ResendTransaction } from "@ethui/ui/components/contract-execution/resend-transaction/index";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ethui/ui/components/shadcn/dialog";
import { useParams } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { Abi, Address, Hex } from "viem";
import { useAccount } from "wagmi";
import { useLatestAddresses } from "#/hooks/useLatestAddresses";
import { useContractExecution } from "../../hooks/useContractExecution";

interface ResendTransactionDialogProps {
  trigger: ReactNode;
  to: Address;
  input: Hex;
  value?: bigint;
  abi?: Abi;
  chainId: number;
  sender?: Address;
}

export function ResendTransactionDialog({
  trigger,
  to,
  input,
  value,
  abi,
  chainId,
  sender,
}: ResendTransactionDialogProps) {
  const execution = useContractExecution(to);
  const { address: connectedAddress, isConnected } = useAccount();

  const { rpc } = useParams({ strict: false });
  const addresses = useLatestAddresses();

  const addressRenderer = (addr: Address) => {
    const addressData = addresses.find((a) => a.address === addr);
    return addressData?.alias || addr;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Resend Transaction</DialogTitle>
          <DialogDescription>
            Review and resend this transaction with modified parameters
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[600px] overflow-y-auto px-1">
          <ResendTransaction
            to={to}
            input={input}
            value={value}
            abi={abi}
            chainId={chainId}
            sender={sender || connectedAddress}
            addresses={addresses}
            requiresConnection={true}
            isConnected={isConnected}
            onQuery={(params) =>
              execution.callAsync({
                data: params.callData,
                value: params.value,
                msgSender: params.msgSender,
              })
            }
            onWrite={(params) =>
              execution.executeAsync({
                callData: params.callData,
                value: params.value,
              })
            }
            onSimulate={(params) =>
              execution.callAsync({
                data: params.callData,
                value: params.value,
                msgSender: params.msgSender,
              })
            }
            addressRenderer={addressRenderer}
            onHashClick={(hash) => {
              window.open(`/rpc/${rpc || ""}/tx/${hash}`, "_blank");
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
