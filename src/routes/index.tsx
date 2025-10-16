import { EthuiLogo } from "@ethui/ui/components/ethui-logo";
import { Form } from "@ethui/ui/components/form";
import { Button } from "@ethui/ui/components/shadcn/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FieldValues, useForm } from "react-hook-form";
import { z } from "zod";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

const rpcSchema = z.object({
  url: z.string().min(1, "RPC URL is required"),
});

function RouteComponent() {
  const navigate = useNavigate();

  const rpcForm = useForm({
    mode: "onBlur",
    resolver: zodResolver(rpcSchema),
    defaultValues: {
      url: "",
    },
  });

  const handleRpcSubmit = (data: FieldValues) => {
    const rpcUrl = data.url;
    const encodedRpc = btoa(rpcUrl);

    navigate({
      to: "/rpc/$rpc",
      params: { rpc: encodedRpc },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-accent p-8">
      <div className="w-full max-w-md animate-fade-in space-y-8 opacity-0">
        <div className="animation-delay-200 flex animate-fade-in justify-center opacity-0">
          <button
            className="cursor-pointer transition-transform duration-200 hover:scale-105"
            onClick={() =>
              window.open("https://ethui.dev/", "_blank", "noopener,noreferrer")
            }
            title="Visit ethui.dev"
            type="button"
          >
            <EthuiLogo size={96} />
          </button>
        </div>

        <div className="animation-delay-400 animate-fade-in space-y-3 text-center opacity-0">
          <h1 className="font-bold text-4xl text-foreground">ethui Explorer</h1>
          <p className="text-lg text-muted-foreground">
            Connect to your local Ethereum network and explore blocks,
            transactions, and contracts
          </p>
        </div>

        <div className="animation-delay-600 animate-fade-in opacity-0">
          <Form form={rpcForm} onSubmit={handleRpcSubmit} className="space-y-4">
            <Form.Text
              name="url"
              placeholder="Enter RPC URL (e.g. ws://localhost:8545)"
              className="w-full text-center"
            />
            <Button type="submit" className="w-full" size="lg">
              Connect to Network
            </Button>
          </Form>
        </div>

        <div className="animation-delay-800 animate-fade-in text-center opacity-0">
          <p className="text-muted-foreground text-sm">
            Make sure your local Ethereum node is running
          </p>
        </div>
      </div>
    </div>
  );
}
