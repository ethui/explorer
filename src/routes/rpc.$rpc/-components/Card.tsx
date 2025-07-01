import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Card as ShadcnCard,
} from "@ethui/ui/components/shadcn/card";
import { clsx } from "clsx";
import { ArrowRight } from "lucide-react";
import { LinkText } from "#/components/LinkText";
import { Tooltip } from "#/components/Tooltip";
import { formatEth } from "#/utils/formatters";

interface CardProps {
  title: string;
  children: React.ReactNode;
  footerLink: {
    text: string;
    to: string;
  };
}

export function Card({ title, children, footerLink }: CardProps) {
  return (
    <ShadcnCard className="m-4 flex flex-col rounded-2xl border shadow-md">
      <CardHeader className="border-b p-5">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 px-4 py-0">{children}</CardContent>
      <CardFooter className="flex items-center justify-center rounded-b-2xl border-t bg-accent p-4">
        <LinkText
          className="!text-muted-foreground hover:!text-solidity-value flex flex-row items-center gap-2"
          to={footerLink.to}
        >
          {footerLink.text} <ArrowRight className="h-4 w-4" />
        </LinkText>
      </CardFooter>
    </ShadcnCard>
  );
}

export function AmountWrapper({
  value,
  title,
}: {
  value: bigint;
  title: string;
}) {
  return (
    <Tooltip content={title}>
      <div className="flex items-center rounded-lg border px-2 py-[6px]">
        <span className="text-xs leading-none whitespace-nowrap">
          {formatEth(value, 5)} Eth
        </span>
      </div>
    </Tooltip>
  );
}

export function LoadingCardContentList({ numItems }: { numItems: number }) {
  return (
    <>
      {Array.from({ length: numItems }).map((_, i) => (
        <CardContentItem key={`loading-${i}`} variant="loading" />
      ))}
    </>
  );
}

export function EmptyCardContentList({ numItems }: { numItems: number }) {
  return (
    <>
      {Array.from({ length: numItems }).map((_, i) => (
        <CardContentItem key={`empty-${i}`} variant="empty" />
      ))}
    </>
  );
}

export function CardContentItem({
  variant = "loading",
}: {
  variant?: "loading" | "empty";
}) {
  const isLoading = variant === "loading";

  return (
    <li
      className={clsx(
        "flex flex-row gap-4 border-b py-4 last:border-b-0 lg:h-[85px]",
        isLoading && "animate-pulse",
      )}
    >
      <div className="flex w-1/3 flex-row items-center gap-2">
        <div
          className={clsx(
            "block h-12 w-12 flex-shrink-0 rounded-lg",
            isLoading && "border bg-accent/50",
          )}
        />
        <div className="flex flex-col gap-1">
          <div
            className={clsx(
              "h-4 w-16 rounded",
              isLoading && "border bg-accent/50",
            )}
          />
          <div
            className={clsx(
              "h-3 w-24 rounded",
              isLoading && "border bg-accent/50",
            )}
          />
        </div>
      </div>
      <div className="flex w-2/3 flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div
            className={clsx(
              "h-4 w-32 rounded",
              isLoading && "border bg-accent/50",
            )}
          />
          <div
            className={clsx(
              "h-3 w-40 rounded",
              isLoading && "border bg-accent/50",
            )}
          />
        </div>
        <div
          className={clsx(
            "h-6 w-20 rounded-lg",
            isLoading && "border bg-accent/50",
          )}
        />
      </div>
    </li>
  );
}
