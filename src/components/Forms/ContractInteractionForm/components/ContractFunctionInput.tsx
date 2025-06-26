import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ethui/ui/components/shadcn/dropdown-menu";
import { Button } from "@ethui/ui/components/shadcn/button";
import { ChevronDown } from "lucide-react";
import type { AbiFunction } from "viem";
import { formatAbiItem } from "viem/utils";

interface ContractFunctionInputProps {
  functions: AbiFunction[];
  onSelectFunction: (func: AbiFunction) => void;
}

export function ContractFunctionInput({
  functions,
  onSelectFunction,
}: ContractFunctionInputProps) {
  const [selectedFunction, setSelectedFunction] = useState<AbiFunction | null>(
    null,
  );

  return (
    <div className="mb-4">
      <label className="mb-2 block font-bold text-base">
        Contract Function
      </label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between text-left min-w-4xl"
          >
            <span className="truncate font-mono text-sm">
              {selectedFunction
                ? formatAbiItem(selectedFunction)
                : "Select a function..."}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-96 overflow-y-auto min-w-4xl">
          {functions.map((func, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => {
                setSelectedFunction(func);
                onSelectFunction(func);
              }}
              className="flex flex-col items-start p-3"
            >
              <div className="w-full">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{func.name}</span>
                  <span className="rounded bg-muted px-2 py-1 text-xs">
                    {func.stateMutability === "view" ||
                    func.stateMutability === "pure"
                      ? "Read"
                      : "Write"}
                  </span>
                </div>
                <code className="text-muted-foreground text-xs break-all">
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
