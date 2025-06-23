import { Form } from "@ethui/ui/components/form";
import { Button } from "@ethui/ui/components/shadcn/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useNavigate, useParams } from "@tanstack/react-router";
import { type FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { useConnectionStore } from "#/store/connection";

export function Topbar({
  showConnectButton = false,
}: {
  showConnectButton?: boolean;
}) {
  const navigate = useNavigate();
  const { rpc } = useParams({ strict: false });
  const { connected, blockNumber, reset } = useConnectionStore();
  const currRpc = rpc ? decodeURIComponent(rpc) : "ws://localhost:8545";

  const schema = z.object({
    url: z.string(),
  });

  const form = useForm({
    mode: "onBlur",
    resolver: zodResolver(schema),
    defaultValues: {
      url: currRpc,
    },
  });

  const handleSubmit = (data: FieldValues) => {
    const newRpc = data.url;
    if (newRpc !== currRpc) {
      reset();
    }
    (navigate as any)({
      to: `/rpc/${encodeURIComponent(newRpc)}`,
      replace: true,
    });
  };

  return (
    <nav className="flex w-full flex-row items-baseline justify-between border-b bg-accent p-5">
      <Form form={form} onSubmit={handleSubmit} className="flex-row gap-[0]">
        <Form.Text
          name="url"
          placeholder="Enter URL (e.g. localhost:8545)"
          className="inline space-y-0"
          onSubmit={handleSubmit}
        />
        <Button type="submit">Go</Button>
      </Form>
      <div className="ml-2">
        {connected === undefined ? (
          <span className="text-highlight">No connection</span>
        ) : connected ? (
          <span className="text-success">
            Connected to {currRpc} (Block: {blockNumber?.toString()})
          </span>
        ) : (
          <span className="text-error">Disconnected</span>
        )}
      </div>
      {showConnectButton && <ConnectButton />}
    </nav>
  );
}
