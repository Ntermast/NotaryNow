// src/components/debug/session-info.tsx
"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SessionInfo() {
  const { data: session, status } = useSession();
  
  if (process.env.NODE_ENV !== "development") {
    return null;
  }
  
  return (
    <Card className="fixed bottom-4 right-4 w-80 opacity-80 hover:opacity-100 transition-opacity z-50">
      <CardHeader className="p-4">
        <CardTitle className="text-sm">Session Debug</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-xs">
          <p><strong>Status:</strong> {status}</p>
          {session && (
            <>
              <p><strong>User:</strong> {session.user?.name || 'N/A'}</p>
              <p><strong>Email:</strong> {session.user?.email || 'N/A'}</p>
              <p><strong>Role:</strong> {session.user?.role || 'N/A'}</p>
              <p><strong>ID:</strong> {session.user?.id || 'N/A'}</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}