'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    } else {
      setLoading(false);
    }
  }, [status, session, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "authenticated" && session?.user?.role === "ADMIN") {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          userRole="admin"
          userName={session.user.name || ""}
          userEmail={session.user.email || ""}
        />
        <div className="md:pl-64 flex flex-col flex-1">
          {children}
        </div>
      </div>
    );
  }

  return null;
}