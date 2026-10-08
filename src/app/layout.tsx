import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "QA Test Management Portal",
  description: "Local QA automation portfolio with a real defect workflow, browser scanning and test evidence."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <nav aria-label="Quick workspace navigation" className="fixed bottom-4 right-4 hidden rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-medium text-slate-600 shadow-panel backdrop-blur md:block">
          <Link href="/dashboard">Open demo workspace</Link>
        </nav>
      </body>
    </html>
  );
}
