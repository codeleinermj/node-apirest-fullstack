"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/context/auth-context";
import { ToastProvider } from "@/components/toast";
import { Navbar } from "@/components/navbar";
import { ScrollProgress } from "@/components/scroll-progress";
import { AuroraBackground } from "@/components/aurora-background";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <AuroraBackground />
        <Navbar />
        <ScrollProgress />
        <main className="pt-20 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen">
          {children}
        </main>
      </ToastProvider>
    </AuthProvider>
  );
}
