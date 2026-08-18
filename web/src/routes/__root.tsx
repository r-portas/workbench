import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import { Layout } from "@/components/layout";
import { Providers } from "@/components/providers";
import { APP_NAME } from "@/lib/app-config";
import { highlightCss } from "@/lib/markdown";
import { listSearchIndexFn } from "@/lib/search.functions";

import appCss from "@/styles.css?url";

export const Route = createRootRoute({
  // Kick off the index without awaiting so the rest of the page can render.
  loader: () => ({
    searchIndex: listSearchIndexFn(),
  }),
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: APP_NAME,
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    styles: [
      {
        children: highlightCss,
      },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  const { searchIndex } = Route.useLoaderData();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Providers>
          <Layout searchIndex={searchIndex} />
        </Providers>
        <Scripts />
      </body>
    </html>
  );
}
