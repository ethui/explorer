import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "#/components/Topbar";

export const Route = createFileRoute("/")({
  component: () => <Topbar />,
});
