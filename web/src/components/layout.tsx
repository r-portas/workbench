import { Outlet } from "@tanstack/react-router";

import { Navbar } from "@/components/navbar";
import type { ItemSummary } from "@/lib/content-collection.server";

interface LayoutProps {
  /** Deferred search index from the root loader. */
  searchIndex: Promise<ItemSummary[]>;
}

/**
 * The app shell: site header above the routed page content.
 */
function Layout({ searchIndex }: LayoutProps) {
  return (
    <div className="min-h-screen">
      <Navbar searchIndex={searchIndex} />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export { Layout };
