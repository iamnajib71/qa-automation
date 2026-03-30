import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

type AppShellProps = {
  children: ReactNode;
  pageTitle?: string;
};

export function AppShell({ children, pageTitle }: AppShellProps) {
  return (
    <div className="app-grid min-h-screen px-4 py-4 lg:px-6 lg:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1600px] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar />
        <div className="flex min-w-0 flex-col gap-4">
          <Topbar pageTitle={pageTitle} />
          <main className="flex-1 rounded-[28px] border border-white/70 bg-white/55 p-5 shadow-panel backdrop-blur-sm lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
