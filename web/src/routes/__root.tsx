import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import { Layout } from "@/components/layout";
import { Providers } from "@/components/providers";
import { APP_NAME } from "@/lib/app-config";
import { listContentFn } from "@/lib/content-collection.functions";
import { highlightCss } from "@/lib/markdown";

import appCss from "@/styles.css?url";

export const Route = createRootRoute({
  // Kick off the index without awaiting so the rest of the page can render.
  loader: () => ({
    searchIndex: listContentFn({ data: {} }),
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
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "icon",
        href: "/favicon.ico",
        sizes: "32x32",
      },
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png",
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
