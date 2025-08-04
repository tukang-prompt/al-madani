
"use client";

import { BottomNav } from '@/components/bottom-nav';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full w-full max-w-md mx-auto flex-col bg-background shadow-lg">
      <div className="flex-1 overflow-y-auto pb-16">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
