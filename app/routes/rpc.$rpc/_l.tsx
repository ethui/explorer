import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Form } from "@ethui/ui/components/form";
import { type FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@ethui/ui/components/shadcn/button";
import { webSocket, createConfig, WagmiProvider, http } from "wagmi";
import { foundry } from "wagmi/chains";
import { useConnectionState } from "#/hooks/useConnectionState";

export const Route = createFileRoute("/rpc/$rpc/_l")({
  loader: ({ params }) => decodeURIComponent(params.rpc),
  component: RouteComponent,
});

function RouteComponent() {
  const rpc = Route.useLoaderData();
  const navigate = useNavigate();

  const schema = z.object({
    url: z.string(),
  });

  const form = useForm({
    mode: "onBlur",
    resolver: zodResolver(schema),
    defaultValues: {
      url: "ws://localhost:8545",
    },
  });

  const transport = rpc.startsWith("ws://") ? webSocket(rpc) : http(rpc);
  const wagmi = createConfig({
    chains: [foundry],
    transports: {
      [foundry.id]: transport,
    },
  });

  const handleSubmit = (data: FieldValues) => {
    navigate({ to: `/rpc/${encodeURIComponent(data.url)}` });
  };

  return (
    <WagmiProvider config={wagmi}>
      <div className="flex flex-col justify-center gap-2">
        <div className="flex w-full flex-row items-baseline justify-between gap-[0] bg-accent p-2">
          <Form
            form={form}
            onSubmit={handleSubmit}
            className="flex-row gap-[0]"
          >
            <Form.Text
              name="url"
              placeholder="Enter URL (e.g. localhost:8545)"
              className="inline"
            />
            <Button type="submit">Go</Button>
          </Form>
          <ConnectionState />
        </div>
        <div className="flex-grow overflow-hidden">
          <Outlet />
        </div>
      </div>
    </WagmiProvider>
  );
}

function ConnectionState() {
  const { connected, blockNumber, rpc } = useConnectionState();

  return (
    connected && (
      <div>
        Connected to: {rpc} at block {blockNumber}
      </div>
    )
  );
}
