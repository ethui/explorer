import { ClickToCopy } from "@ethui/ui/components/click-to-copy";
import type { Address } from "viem";
import useAddressAlias from "#/hooks/useAddressAlias";
import { truncateHex } from "#/utils/hash";

interface AddressViewProps {
  address: Address;
  text?: string;
}

export function AddressView({ address, text }: AddressViewProps) {
  const { data: alias } = useAddressAlias({ address });

  const displayText = alias || text || truncateHex(address);

  return <ClickToCopy text={address}>{displayText}</ClickToCopy>;
}
