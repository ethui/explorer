import { Button } from "@ethui/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ethui/ui/components/shadcn/dropdown-menu";
import { ChevronDown } from "lucide-react";
import type { AbiFunction } from "viem";
import { formatAbiItem } from "viem/utils";

interface ContractFunctionInputProps {
  functions: AbiFunction[];
  onSelectFunction: (func: AbiFunction) => void;
  selectedFunction?: AbiFunction | null;
}

export function ContractFunctionInput({
  functions,
  onSelectFunction,
  selectedFunction,
}: ContractFunctionInputProps) {
  return (
    <div className="mb-4">
      <span className="mb-2 block font-bold text-base">Contract Function</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between text-left"
          >
            <span className="truncate font-mono text-sm">
              {selectedFunction
                ? formatAbiItem(selectedFunction)
                : "Select a function..."}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-96 min-w-4xl overflow-y-auto">
          {functions.map((func, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => {
                onSelectFunction(func);
              }}
              className="flex w-full flex-col items-start p-3"
            >
              <div className="w-full">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium">{func.name}</span>
                  <span className="rounded bg-muted px-2 py-1 text-xs">
                    {func.stateMutability === "view" ||
                    func.stateMutability === "pure"
                      ? "Read"
                      : "Write"}
                  </span>
                </div>
                <code className="break-all text-muted-foreground text-xs">
                  {formatAbiItem(func)}
                </code>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
