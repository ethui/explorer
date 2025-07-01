import PageContainer from "#/components/PageContainer";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/rpc/$rpc/_l/tx/$tx")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageContainer header="Transaction Details">
      <div></div>
    </PageContainer>
  );
}
