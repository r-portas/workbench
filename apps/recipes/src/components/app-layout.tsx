import { Outlet } from "@tanstack/react-router";

/**
 * The app shell
 */
function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export { AppLayout };
