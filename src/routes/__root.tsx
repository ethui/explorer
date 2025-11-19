import { TooltipProvider } from "@ethui/ui/components/shadcn/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Suspense } from "react";

import React from "react";
import appCss from "#/app.css?url";
import { DefaultCatchBoundary } from "#/components/DefaultCatchBoundary";
import { NotFound } from "#/components/NotFound";
import Toast from "#/components/Toast";
import { initializeAnalytics } from "#/utils/analytics";
import { seo } from "#/utils/seo";

export interface RouteContext {
  queryClient: QueryClient;
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
        title: "ethui explorer",
        description: "An Ethereum local explorer",
        image: "/symbol-black.svg",
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

function RootComponent() {
  return (
    <RootDocument>
      <ClientProviders>
        <Outlet />
      </ClientProviders>
    </RootDocument>
  );
}

function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());

  React.useEffect(() => {
    initializeAnalytics();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{children}</TooltipProvider>
    </QueryClientProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body data-gr-ext-installed="" data-new-gr-c-s-check-loaded="14.1240.0">
        <main className="min-h-screen bg-accent">{children}</main>
        <Suspense>
          <TanStackRouterDevtools position="bottom-right" />
        </Suspense>
        <Scripts />
        <Toast />
      </body>
    </html>
  );
}
