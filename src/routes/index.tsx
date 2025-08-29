import { Form } from "@ethui/ui/components/form";
import { Button } from "@ethui/ui/components/shadcn/button";
import { EthuiLogo } from "@ethui/ui/components/ethui-logo";
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

    (navigate as any)({
      to: "/rpc/$rpc",
      params: { rpc: encodedRpc },
    });
  };

  return (
    <div className="min-h-screen bg-accent flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8 opacity-0 animate-fade-in">
        <div className="flex justify-center opacity-0 animate-fade-in animation-delay-200">
          <div
            className="cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() =>
              window.open("https://ethui.dev/", "_blank", "noopener,noreferrer")
            }
            title="Visit ethui.dev"
          >
            <EthuiLogo size={96} />
          </div>
        </div>

        <div className="text-center space-y-3 opacity-0 animate-fade-in animation-delay-400">
          <h1 className="text-4xl font-bold text-foreground">ethui Explorer</h1>
          <p className="text-muted-foreground text-lg">
            Connect to your local Ethereum network and explore blocks,
            transactions, and contracts
          </p>
        </div>

        <div className="opacity-0 animate-fade-in animation-delay-600">
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

        <div className="text-center opacity-0 animate-fade-in animation-delay-800">
          <p className="text-sm text-muted-foreground">
            Make sure your local Ethereum node is running
          </p>
        </div>
      </div>
    </div>
  );
}
