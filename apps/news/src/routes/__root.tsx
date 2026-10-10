import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import { AppLayout } from "@/components/app-layout";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/app-config";

import appCss from "@/styles.css?url";

export const Route = createRootRoute({
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
      {
        name: "description",
        content: APP_DESCRIPTION,
      },
      {
        // Matches --background so mobile browser chrome blends into the page
        name: "theme-color",
        content: "#0c0a09",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:title",
        content: APP_NAME,
      },
      {
        property: "og:description",
        content: APP_DESCRIPTION,
      },
      {
        name: "twitter:card",
        content: "summary",
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
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AppLayout />
        <Scripts />
      </body>
    </html>
  );
}
