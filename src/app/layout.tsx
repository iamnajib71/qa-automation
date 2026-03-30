import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "QA Test Management Portal",
  description: "Portfolio-ready QA workflow software built with Next.js, TypeScript, Tailwind CSS, and Supabase."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <div className="fixed bottom-4 right-4 hidden rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-medium text-slate-600 shadow-panel backdrop-blur md:block">
          <Link href="/dashboard">Open demo workspace</Link>
        </div>
      </body>
    </html>
  );
}
