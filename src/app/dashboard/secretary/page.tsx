// src/app/dashboard/secretary/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface DashboardStats {
  todayAppointments: number;
  pendingApprovals: number;
  activeNotaries: number;
  totalCustomers: number;
  recentAppointments: Array<{
    id: string;
    customerName: string;
    notaryName: string;
    serviceName: string;
    date: string;
    status: string;
  }>;
}

export default function SecretaryDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    pendingApprovals: 0,
    activeNotaries: 0,
    totalCustomers: 0,
    recentAppointments: []
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "SECRETARY") {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    }
  }, [status, session, router]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (status === "authenticated") {
        try {
          const [appointmentsRes, notariesRes, customersRes] = await Promise.all([
            fetch("/api/appointments"),
            fetch("/api/notaries"),
            fetch("/api/admin/users?role=CUSTOMER")
          ]);

          const appointments = appointmentsRes.ok ? await appointmentsRes.json() : [];
          const notaries = notariesRes.ok ? await notariesRes.json() : [];
          const customers = customersRes.ok ? await customersRes.json() : [];

          const today = new Date().toDateString();
          const todayAppointments = appointments.filter((apt: any) => 
            new Date(apt.date).toDateString() === today
          ).length;

          const pendingApprovals = appointments.filter((apt: any) => 
            apt.status === "PENDING"
          ).length;

          const recentAppointments = appointments
            .slice(0, 5)
            .map((apt: any) => ({
              id: apt.id,
              customerName: apt.customer?.name || "Unknown",
              notaryName: apt.notary?.name || "Unknown",
              serviceName: apt.service?.name || "Unknown",
              date: apt.date,
              status: apt.status
            }));

          setStats({
            todayAppointments,
            pendingApprovals,
            activeNotaries: notaries.length || 0,
            totalCustomers: customers.length || 0,
            recentAppointments
          });
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchDashboardData();
  }, [status]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      CONFIRMED: { variant: "default", icon: CheckCircle },
      PENDING: { variant: "secondary", icon: Clock },
      COMPLETED: { variant: "outline", icon: CheckCircle },
      CANCELLED: { variant: "destructive", icon: AlertCircle }
    };

    const config = variants[status] || variants.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "authenticated" && session.user.role === "SECRETARY") {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          userRole="secretary"
          userName={session.user.name}
          userEmail={session.user.email}
        />

        <div className="md:pl-64 flex flex-col flex-1">
          {/* Header */}
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
            <div className="flex flex-1 justify-between px-4 md:px-6">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">Secretary Dashboard</h1>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600">
                  Welcome back, {session.user.name}
                </span>
              </div>
            </div>
          </div>

          <main className="flex-1 p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayAppointments}</div>
                  <p className="text-xs text-muted-foreground">Scheduled for today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
                  <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Notaries</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeNotaries}</div>
                  <p className="text-xs text-muted-foreground">Currently available</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>Latest appointment requests and status updates</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{appointment.customerName}</span>
                            <span className="text-muted-foreground">with</span>
                            <span className="font-medium">{appointment.notaryName}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.serviceName} • {new Date(appointment.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(appointment.status)}
                          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/secretary/appointments")}>
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent appointments found
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-16 justify-start"
                  onClick={() => router.push("/dashboard/secretary/appointments")}
                >
                  <CalendarDays className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Manage Appointments</div>
                    <div className="text-sm text-muted-foreground">View and organize schedules</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-16 justify-start"
                  onClick={() => router.push("/dashboard/secretary/notaries")}
                >
                  <Users className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Notary Management</div>
                    <div className="text-sm text-muted-foreground">Support notary operations</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-16 justify-start"
                  onClick={() => router.push("/dashboard/secretary/customers")}
                >
                  <FileText className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Customer Support</div>
                    <div className="text-sm text-muted-foreground">Assist customer inquiries</div>
                  </div>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return null;
}