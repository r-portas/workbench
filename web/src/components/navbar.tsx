import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { WorkbenchIcon } from "@/components/workbench-icon";
import { WorkbenchSearch } from "@/components/workbench-search";
import { APP_NAME } from "@/lib/app-config";
import type { SearchItem } from "@/lib/content-collection.types";

interface NavbarProps {
  /** Deferred search index passed through to workbench search. */
  searchIndex: Promise<SearchItem[]>;
}

/**
 * Site header with brand, optional back control, and centered workbench search.
 */
function Navbar({ searchIndex }: NavbarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showBack = pathname !== "/";

  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-border bg-card px-3 py-1">
      <div className="flex min-w-0 items-center gap-1 justify-self-start">
        {showBack && (
          <ButtonLink
            to="/"
            variant="ghost"
            size="sm"
            aria-label="Back to home"
            className="text-muted-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-1 motion-safe:duration-200"
          >
            <ChevronLeft />
            Back
          </ButtonLink>
        )}
        <Link to="/" className="flex items-center gap-2 text-md font-semibold">
          <WorkbenchIcon className="size-5" />
          {APP_NAME}
        </Link>
      </div>
      <div className="w-[min(24rem,calc(100vw-12rem))] justify-self-center">
        <WorkbenchSearch searchIndex={searchIndex} />
      </div>
      <div aria-hidden className="justify-self-end" />
    </header>
  );
}

export { Navbar };
