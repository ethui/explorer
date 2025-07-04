import { clsx } from "clsx";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

export interface ChipProps {
  children: React.ReactNode;
  variant?: "success" | "error" | "info" | "warning" | "default";
  showIcon?: boolean;
}

const getVariantStyles = (variant: ChipProps["variant"]) => {
  switch (variant) {
    case "success":
      return "border-green-500 bg-green-100 text-green-800";
    case "error":
      return "border-red-500 bg-red-100 text-red-800";
    case "info":
      return "border-blue-500 bg-blue-100 text-blue-800";
    case "warning":
      return "border-yellow-500 bg-yellow-100 text-yellow-800";
    default:
      return "border-gray-500 bg-gray-100 text-gray-800";
  }
};

const getIcon = (variant: ChipProps["variant"], showIcon: boolean) => {
  if (!showIcon) return null;

  switch (variant) {
    case "success":
      return <CheckCircle size={10} />;
    case "error":
      return <XCircle size={10} />;
    case "info":
      return <Info size={10} />;
    case "warning":
      return <AlertCircle size={10} />;
    default:
      return null;
  }
};

export function Chip({
  children,
  variant = "default",
  showIcon = false,
}: ChipProps) {
  return (
    <div
      className={clsx(
        "flex w-fit flex-shrink-0 flex-row items-center gap-1 rounded border-2 p-1 text-xs",
        getVariantStyles(variant),
      )}
    >
      {getIcon(variant, showIcon)}
      {children}
    </div>
  );
}
