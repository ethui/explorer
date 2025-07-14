import type { Address } from "viem";
import useAddressAlias from "#/hooks/useAddressAlias";
import { truncateHex } from "#/utils/hash";
import { LinkText } from "./LinkText";

interface AddressLinkProps {
  address: Address;
  text?: string;
}

export function AddressLink({ address, text }: AddressLinkProps) {
  const { data: alias } = useAddressAlias({ address });

  const displayText = alias || text || truncateHex(address);

  return (
    <LinkText
      to="/rpc/$rpc/address/$address"
      params={{ address }}
      tooltip={address}
    >
      {displayText}
    </LinkText>
  );
}
