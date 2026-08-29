import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { WorkbenchIcon } from "@/components/workbench-icon";
import { WorkbenchSearch } from "@/components/workbench-search";
import { APP_NAME } from "@/lib/app-config";
import type { ItemSummary } from "@/lib/content-collection.types";

interface NavbarProps {
  /** Deferred search index passed through to workbench search. */
  searchIndex: Promise<ItemSummary[]>;
}

/**
 * Site header with brand, optional back control, and centered workbench search.
 */
function Navbar({ searchIndex }: NavbarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showBack = pathname !== "/";

  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-border bg-card px-4 py-2">
      <div className="flex min-w-0 items-center gap-1.5 justify-self-start">
        {showBack ? (
          <ButtonLink
            to="/"
            variant="ghost"
            size="default"
            aria-label="Back to home"
            className="text-muted-foreground"
          >
            <ChevronLeft />
            Back
          </ButtonLink>
        ) : (
          <Link to="/" className="hidden items-center gap-2 text-base font-semibold md:flex">
            <WorkbenchIcon className="size-6" />
            {APP_NAME}
          </Link>
        )}
      </div>
      <div className="w-[min(28rem,calc(100vw-14rem))] justify-self-center">
        <WorkbenchSearch searchIndex={searchIndex} />
      </div>
      <div className="justify-self-end">
        <ButtonLink variant="outline" reloadDocument to="/llms.txt">
          llms.txt
        </ButtonLink>
      </div>
    </header>
  );
}

export { Navbar };
