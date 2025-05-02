import { Form } from "@ethui/ui/components/form";
import { Button } from "@ethui/ui/components/shadcn/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { type FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import appCss from "#/app.css?url";
import { DefaultCatchBoundary } from "#/components/DefaultCatchBoundary";
import { NotFound } from "#/components/NotFound";
import { useConnectionStore } from "#/store/connection";
import { seo } from "#/utils/seo";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        })),
      );

export interface RouteContext {
  breadcrumb?: string;
}

export const Route = createRootRouteWithContext<RouteContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: "@ethui/explorer",
        description: "An Ethereum toolkit",
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/symbol-black.svg",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/symbol-black.svg",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/symbol-black.svg" },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

const queryClient = new QueryClient();

function RootComponent() {
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <RpcForm />
        <Outlet />
      </QueryClientProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Suspense>
          <TanStackRouterDevtools position="bottom-right" />
        </Suspense>
        <Scripts />
      </body>
    </html>
  );
}

function RpcForm() {
  const navigate = useNavigate();
  const { rpc } = useParams({ strict: false });
  const { connected, blockNumber, reset } = useConnectionStore();
  const currentRpc = rpc ? decodeURIComponent(rpc) : "ws://localhost:8545";

  const schema = z.object({
    url: z.string(),
  });

  const form = useForm({
    mode: "onBlur",
    resolver: zodResolver(schema),
    defaultValues: {
      url: currentRpc,
    },
  });

  const handleSubmit = (data: FieldValues) => {
    const newRpc = data.url;
    if (newRpc !== currentRpc) {
      reset();
    }
    navigate({ to: `/rpc/${encodeURIComponent(newRpc)}`, replace: true });
  };

  return (
    <nav>
      <div className="flex w-full flex-row items-baseline justify-between gap-[0] bg-accent p-2">
        <Form form={form} onSubmit={handleSubmit} className="flex-row gap-[0]">
          <Form.Text
            name="url"
            placeholder="Enter URL (e.g. localhost:8545)"
            className="inline"
            onSubmit={handleSubmit}
          />
          <Button type="submit">Go</Button>
        </Form>
        <div className="ml-2">
          {connected === undefined ? (
            <span className="text-gray-500">No connection</span>
          ) : connected ? (
            <span className="text-green-500">
              Connected to {currentRpc} (Block: {blockNumber?.toString()})
            </span>
          ) : (
            <span className="text-red-500">Disconnected</span>
          )}
        </div>
      </div>
    </nav>
  );
}
