import { Outlet } from "@tanstack/react-router";

/**
 * The app shell around the routed page content.
 */
function AppLayout() {
  return (
    <main className="min-h-screen p-4 sm:p-6">
      <Outlet />
    </main>
  );
}

export { AppLayout };
