import { Outlet } from "@tanstack/react-router";

import { Navbar } from "@/components/navbar";

/**
 * The app shell: site header above the routed page content.
 */
function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export { AppLayout };
