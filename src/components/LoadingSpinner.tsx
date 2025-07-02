import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );
}
