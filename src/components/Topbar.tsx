import { Form } from "@ethui/ui/components/form";
import { Button } from "@ethui/ui/components/shadcn/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useNavigate, useParams } from "@tanstack/react-router";
import { type FieldValues, useForm } from "react-hook-form";
import { isAddress, isHash } from "viem";
import { z } from "zod";
import { useConnectionStore } from "#/store/connection";
import { isBlockNumber } from "#/utils/validators";

export function Topbar({
  showConnectButton = false,
}: {
  showConnectButton?: boolean;
}) {
  const navigate = useNavigate();
  const { rpc } = useParams({ strict: false });
  const { connected, blockNumber, reset } = useConnectionStore();
  const currRpc = rpc ? atob(rpc) : "ws://localhost:8545";

  const rpcSchema = z.object({
    url: z.string(),
  });

  const rpcForm = useForm({
    mode: "onBlur",
    resolver: zodResolver(rpcSchema),
    defaultValues: {
      url: currRpc,
    },
  });

  const handleRpcSubmit = (data: FieldValues) => {
    const newRpc = data.url;
    if (newRpc !== currRpc) {
      reset();
    }
    (navigate as any)({
      to: `/rpc/${btoa(newRpc)}`,
      replace: true,
    });
  };

  return (
    <nav className="flex w-full flex-row items-center justify-between gap-4 border-b bg-accent px-5 pt-5">
      <Form
        form={rpcForm}
        onSubmit={handleRpcSubmit}
        className="flex-row gap-[0]"
      >
        <Form.Text
          name="url"
          placeholder="Enter URL (e.g. localhost:8545)"
          className="inline w-48 space-y-0"
          onSubmit={handleRpcSubmit}
        />
        <Button type="submit">Go</Button>
      </Form>

      {connected && <SearchBar currRpc={currRpc} />}
      <div className="flex items-center gap-4 pb-5">
        <div>
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
      </div>
    </nav>
  );
}

function SearchBar({ currRpc }: { currRpc: string }) {
  const navigate = useNavigate();

  const searchForm = useForm({
    defaultValues: {
      search: "",
    },
  });

  const handleSearchSubmit = ({ search }: FieldValues) => {
    const searchTerm = search.trim();
    const basePath = `/rpc/${btoa(currRpc)}`;

    if (isAddress(searchTerm)) {
      (navigate as any)({
        to: `${basePath}/address/${searchTerm}`,
      });
    } else if (isBlockNumber(searchTerm)) {
      (navigate as any)({
        to: `${basePath}/block/${searchTerm}`,
      });
    } else if (isHash(searchTerm)) {
      (navigate as any)({
        to: `${basePath}/tx/${searchTerm}`,
      });
    } else {
      (navigate as any)({
        to: `${basePath}/not-found`,
      });
    }

    searchForm.reset();
  };

  return (
    <Form
      form={searchForm}
      onSubmit={handleSearchSubmit}
      className="flex-row gap-[0]"
    >
      <Form.Text
        name="search"
        placeholder="Search by Address / Txn Hash / Block"
        className="inline w-96 space-y-0"
      />
      <Button type="submit">Search</Button>
    </Form>
  );
}
