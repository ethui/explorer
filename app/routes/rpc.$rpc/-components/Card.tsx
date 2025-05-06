import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Card as ShadcnCard,
} from "@ethui/ui/components/shadcn/card";
import { ArrowRight } from "lucide-react";
import { LinkText } from "#/components/LinkText";

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
