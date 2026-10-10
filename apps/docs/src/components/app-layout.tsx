import { Outlet } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { Sidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { APP_ICON, SIDEBAR_ITEMS } from "@/lib/app-config";

/**
 * The app shell, a sidebar alongside the routed page content.
 */
function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar appIcon={APP_ICON} items={SIDEBAR_ITEMS}>
        <Tooltip>
          <TooltipTrigger
            render={
              <ButtonLink
                to="/llms.txt"
                reloadDocument
                aria-label="llms.txt"
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&_svg]:size-5"
              >
                <ScrollText />
              </ButtonLink>
            }
          />
          <TooltipContent side="right">llms.txt</TooltipContent>
        </Tooltip>
      </Sidebar>
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export { AppLayout };
