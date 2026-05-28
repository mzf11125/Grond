import { Outlet } from "react-router-dom";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarNav />
      <main className="flex-1 overflow-auto lg:ml-0">
        <div className="mx-auto max-w-6xl p-4 pt-14 lg:p-8 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
