import { Link } from "@tanstack/react-router";

import { WorkbenchSearch } from "@/components/workbench-search";
import { APP_NAME } from "@/lib/app-config";

/**
 * Site header with the app name and workbench-wide search.
 */
function Navbar() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-3">
      <Link to="/" className="text-lg font-semibold">
        {APP_NAME}
      </Link>
      <WorkbenchSearch />
    </header>
  );
}

export { Navbar };
