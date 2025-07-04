import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Loader2 size={32} className="animate-spin" />
    </div>
  );
}
