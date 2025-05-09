// src/components/auth/session-provider.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SessionProvider({ 
  children,
  requiredRole
}: { 
  children: React.ReactNode;
  requiredRole?: string;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (requiredRole && session?.user?.role !== requiredRole) {
      router.push(`/dashboard/${session?.user?.role?.toLowerCase() || 'customer'}`);
    }
  }, [status, session, router, requiredRole]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (requiredRole && session?.user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}