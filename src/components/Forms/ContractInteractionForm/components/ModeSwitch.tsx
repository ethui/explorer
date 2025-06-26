import { Switch } from "@ethui/ui/components/shadcn/switch";

interface ModeSwitchProps {
  useContractFunctions: boolean;
  setUseContractFunctions: (value: boolean) => void;
}

export function ModeSwitch({
  useContractFunctions,
  setUseContractFunctions,
}: ModeSwitchProps) {
  return (
    <div className="mb-4">
      <label className="font-semibold text-base">Raw Signature Mode</label>
      <p className="text-muted-foreground text-sm">
        Switch between contract functions and raw signature input.
      </p>
      <div className="mt-2">
        <Switch
          checked={useContractFunctions}
          onCheckedChange={setUseContractFunctions}
        />
      </div>
    </div>
  );
}
