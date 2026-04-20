'use client';

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Separator } from "@/components/ui/separator";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col bg-slate-50 min-h-screen">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="font-semibold text-sm">Dashboard Overview</h1>
        </header>
        <div className="p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
