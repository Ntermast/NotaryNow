// src/components/debug/session-info.tsx
"use client";

import { useSession } from "next-auth/react";

export function SessionInfo() {
  const { data: session, status } = useSession();
  
  if (process.env.NODE_ENV !== "development") {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-xs opacity-20 hover:opacity-90 transition-opacity z-50 max-w-xs">
      <div className="truncate">
        {status === 'authenticated' ? `${session?.user?.role}: ${session?.user?.name}` : status}
      </div>
    </div>
  );
}