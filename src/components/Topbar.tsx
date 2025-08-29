import { EthuiLogo } from "@ethui/ui/components/ethui-logo";
import { Form } from "@ethui/ui/components/form";
import { Button } from "@ethui/ui/components/shadcn/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Box, LogOut } from "lucide-react";
import { type FieldValues, useForm } from "react-hook-form";
import { useConnectionStore } from "#/store/connection";

export function Topbar({
  showConnectButton = false,
}: {
  showConnectButton?: boolean;
}) {
  const { rpc } = useParams({ strict: false });
  const { connected, blockNumber, reset } = useConnectionStore();
  const currRpc = rpc ? atob(rpc) : "ws://localhost:8545";
  const navigate = useNavigate();

  const handleDisconnect = () => {
    reset();
    (navigate as any)({
      to: "/",
    });
  };

  const handleLogoClick = () => {
    if (rpc) {
      (navigate as any)({
        to: "/rpc/$rpc",
        params: { rpc },
      });
    }
  };

  return (
    <nav className="flex w-full flex-row items-center justify-between gap-4 border-b bg-accent px-5 pt-5">
      <button
        type="button"
        onClick={handleLogoClick}
        className="cursor-pointer pb-5 transition-transform duration-200 hover:scale-105"
        title="Go to dashboard"
      >
        <EthuiLogo size={32} />
      </button>

      {connected && <SearchBar currRpc={currRpc} />}

      <div className="flex items-center gap-2 pb-5">
        <ConnectionStatus
          currRpc={currRpc}
          connected={connected ?? false}
          blockNumber={Number(blockNumber)}
          handleDisconnect={handleDisconnect}
        />
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

    if (!searchTerm) return;

    (navigate as any)({
      to: `/rpc/${btoa(currRpc)}/search`,
      search: { q: searchTerm },
    });

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

function ConnectionStatus({
  currRpc,
  connected,
  blockNumber,
  handleDisconnect,
}: {
  currRpc: string;
  connected: boolean;
  blockNumber: number;
  handleDisconnect: () => void;
}) {
  return (
    <div className="flex items-center gap-4">
      {connected === undefined ? (
        <span className="text-highlight">No connection</span>
      ) : connected ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-success">{currRpc}</span>
          <div className="flex items-center gap-1 text-success">
            <Box size={16} />
            <span className="font-mono">#{blockNumber?.toString()}</span>
          </div>
          <DisconnectButton handleDisconnect={handleDisconnect} />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-error">Disconnected</span>
          <DisconnectButton handleDisconnect={handleDisconnect} />
        </div>
      )}
    </div>
  );
}

function DisconnectButton({
  handleDisconnect,
}: {
  handleDisconnect: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDisconnect}
      className="text-muted-foreground hover:text-foreground"
    >
      <LogOut size={16} />
    </Button>
  );
}
