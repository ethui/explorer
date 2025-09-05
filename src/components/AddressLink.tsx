import { FileCode2 } from "lucide-react";
import type { Address } from "viem";
import useAddressAlias from "#/hooks/useAddressAlias";
import { useIsContract } from "#/hooks/useIsContract";
import { truncateHex } from "#/utils/hash";
import { LinkText } from "./LinkText";

interface AddressLinkProps {
  address: Address;
  text?: string;
  showIcon?: boolean;
}

export function AddressLink({
  address,
  text,
  showIcon = true,
}: AddressLinkProps) {
  const { data: alias } = useAddressAlias({ address });
  const { isContract } = useIsContract(showIcon ? address : undefined);

  const displayText = alias || text || truncateHex(address);

  return (
    <LinkText
      to="/rpc/$rpc/address/$address"
      params={{ address }}
      tooltip={address}
      className="flex flex-row items-center gap-1"
    >
      {showIcon && isContract && (
        <FileCode2 size={16} className="text-muted-foreground" />
      )}

      {displayText}
    </LinkText>
  );
}
