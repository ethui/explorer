import { createFileRoute } from "@tanstack/react-router";
import PageContainer from "#/components/PageContainer";

export const Route = createFileRoute("/rpc/$rpc/_l/tx/$tx")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageContainer header="Transaction Details">
      <div />
    </PageContainer>
  );
}
