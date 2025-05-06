import { Link } from "@tanstack/react-router";
import { clsx } from "clsx";
import { Tooltip } from "./Tooltip";

interface LinkTextProps {
  to: string;
  params?: Record<string, string>;
  children: React.ReactNode;
  className?: string;
  tooltip?: string;
}

export function LinkText({
  to,
  params,
  children,
  className,
  tooltip,
}: LinkTextProps) {
  const link = (
    <Link
      to={to}
      params={params}
      preload={false}
      className={clsx(
        className,
        "text-sm text-solidity-value hover:text-sky-700",
      )}
    >
      {children}
    </Link>
  );

  if (!tooltip) return link;

  return <Tooltip content={tooltip}>{link}</Tooltip>;
}
