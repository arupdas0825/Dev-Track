"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { MAINTENANCE_MODE } from "@/lib/featureFlags";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-[#0D1117] items-center justify-center p-8 text-[#8B949E]">
          <svg className="animate-spin h-10 w-10 text-[#2F81F7] mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold tracking-wide font-mono">Initializing Dashboard...</span>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
