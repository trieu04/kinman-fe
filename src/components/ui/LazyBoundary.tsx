import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

export function LazyBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Loading...</p>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
