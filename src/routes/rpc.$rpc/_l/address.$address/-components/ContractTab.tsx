import { ContractExecutionTabs } from "@ethui/ui/components/contract-execution/contract-execution-tabs";
import { Button } from "@ethui/ui/components/shadcn/button";
import { Card } from "@ethui/ui/components/shadcn/card";
import type { Address } from "viem";
import { useAccount, useChainId } from "wagmi";
import { AddressView } from "#/components/AddressView";
import { AbiDialogForm } from "#/components/Forms/AbiDialogForm";
import useAbi from "#/hooks/useAbi";
import { useContractExecution } from "#/hooks/useContractExecution";
import { useLatestAddresses } from "#/hooks/useLatestAddresses";
import { useConnectionStore } from "#/store/connection";

interface ContractTabProps {
  address: Address;
}

function NoAbiComponent({ address }: { address: Address }) {
  return (
    <div className="space-y-4 p-8 text-center">
      <div>
        <h3 className="mb-2 font-semibold text-lg">No ABI Available</h3>
        <p className="mx-auto max-w-md text-muted-foreground text-sm">
          This contract doesn't have an ABI added to the explorer. You can use
          the ethui extension to load it, or add the ABI manually.
        </p>
      </div>
      <AbiDialogForm
        address={address}
        trigger={<Button variant="outline">Add ABI</Button>}
      />
    </div>
  );
}

export function ContractTab({ address }: ContractTabProps) {
  const chainId = useChainId();

  const { rpc } = useConnectionStore();

  const latestAddresses = useLatestAddresses();
  const { address: connectedAddress } = useAccount();
  const execution = useContractExecution(address);
  const { abi } = useAbi({ address });

  return (
    <div className="flex justify-center">
      <Card className="min-h-[600px] w-[1000px] rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-6 font-semibold text-2xl">Contract Interaction</h2>

        <ContractExecutionTabs
          abi={abi ?? []}
          address={address}
          sender={connectedAddress}
          chainId={chainId}
          addresses={latestAddresses}
          requiresConnection={true}
          isConnected={execution.isConnected}
          onQuery={(params) =>
            execution.callAsync({
              data: params.callData,
              value: params.value,
              msgSender: params.msgSender,
            })
          }
          onWrite={(params) =>
            execution.executeAsync({ callData: params.callData })
          }
          onSimulate={(params) =>
            execution.callAsync({
              data: params.callData,
              value: params.value,
              msgSender: params.msgSender,
            })
          }
          NoAbiComponent={() => <NoAbiComponent address={address} />}
          addressRenderer={(addr) => <AddressView address={addr} />}
          onHashClick={(hash) => {
            const url = `/rpc/${btoa(rpc ?? "")}/tx/${hash}`;
            window.open(url, "_blank", "noopener,noreferrer");
          }}
        />
      </Card>
    </div>
  );
}
