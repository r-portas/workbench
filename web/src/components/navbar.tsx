import { Link } from "@tanstack/react-router";

import { WorkbenchSearch } from "@/components/workbench-search";
import { APP_NAME } from "@/lib/app-config";
import type { SearchItem } from "@/lib/content-collection.types";

interface NavbarProps {
  /** Deferred search index passed through to workbench search. */
  searchIndex: Promise<SearchItem[]>;
}

/**
 * Site header with the app name and workbench-wide search.
 */
function Navbar({ searchIndex }: NavbarProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-3">
      <Link to="/" className="text-lg font-semibold">
        {APP_NAME}
      </Link>
      <WorkbenchSearch searchIndex={searchIndex} />
    </header>
  );
}

export { Navbar };
