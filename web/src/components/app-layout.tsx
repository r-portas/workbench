import { Outlet } from "@tanstack/react-router";

import { Navbar } from "@/components/navbar";

/**
 * The app shell, a sidebar alongside the routed page content.
 */
function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

export { AppLayout };
