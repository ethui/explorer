import { createFileRoute } from "@tanstack/react-router";
import { type Hash, isHash } from "viem";
import PageContainer from "#/components/PageContainer";
import { Tabs } from "#/components/Tabs";
import Logs from "./-components/Logs";
import Overview from "./-components/Overview";

export const Route = createFileRoute("/rpc/$rpc/_l/tx/$tx/")({
  component: RouteComponent,
  loader: ({ params }) => {
    if (!isHash(params.tx)) {
      throw new Error("The transaction hash is not valid");
    }
    return { tx: params.tx as Hash };
  },
});

function RouteComponent() {
  const { tx } = Route.useLoaderData();

  return (
    <PageContainer header="Transaction Details">
      <Tabs
        tabs={[
          { label: "Overview", component: <Overview tx={tx} /> },
          { label: "Logs", component: <Logs tx={tx} /> },
        ]}
      />
    </PageContainer>
  );
}
