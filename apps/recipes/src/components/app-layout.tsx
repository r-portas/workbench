import { Outlet } from "@tanstack/react-router";

/**
 * The app shell
 */
function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <main className="min-w-0 flex-1 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}

export { AppLayout };
