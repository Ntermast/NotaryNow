'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger, TabsContent, Tabs } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Users, Briefcase, ShieldCheck, BellIcon, SettingsIcon } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalNotaries: 0,
    pendingApprovals: 0,
    totalAppointments: 0
  });
  const [notaries, setNotaries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    }
  }, [status, session, router]);

  // Mock data for demonstration
  useEffect(() => {
    if (status === "authenticated") {
      // In a real app, this would fetch from API endpoints
      setStatistics({
        totalUsers: 42,
        totalNotaries: 15,
        pendingApprovals: 3,
        totalAppointments: 156
      });

      setNotaries([
        {
          id: "1",
          name: "John Smith",
          email: "john.smith@example.com",
          isApproved: true,
          location: "Manhattan, NY",
          joinDate: "Mar 2, 2025",
          servicesCount: 3
        },
        {
          id: "2",
          name: "Sarah Johnson",
          email: "sarah.johnson@example.com",
          isApproved: false,
          location: "Brooklyn, NY",
          joinDate: "Mar 5, 2025",
          servicesCount: 4
        },
        {
          id: "3",
          name: "Michael Brown",
          email: "michael.brown@example.com",
          isApproved: true,
          location: "Queens, NY",
          joinDate: "Mar 1, 2025",
          servicesCount: 5
        }
      ]);

      setLoading(false);
    }
  }, [status]);

  const handleApproveNotary = (id) => {
    // In a real app, would call API to approve notary
    setNotaries(prev => 
      prev.map(notary => 
        notary.id === id ? { ...notary, isApproved: true } : notary
      )
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "authenticated" && session.user.role === "ADMIN") {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          userRole="admin"
          userName={session.user.name}
          userEmail={session.user.email}
        />

        <div className="md:pl-64 flex flex-col flex-1">
          {/* Top navbar */}
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
            <div className="flex flex-1 justify-between px-4 md:px-6">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">Admin Dashboard</h1>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <BellIcon className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="outline" size="icon">
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Dashboard content */}
          <main className="flex-1 pb-8">
            <div className="mt-8 px-4 sm:px-6 lg:px-8">
              {/* Stats cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Total Users"
                  value={statistics.totalUsers}
                  icon={Users}
                />
                <StatsCard
                  title="Notaries"
                  value={statistics.totalNotaries}
                  icon={Briefcase}
                />
                <StatsCard
                  title="Pending Approvals"
                  value={statistics.pendingApprovals}
                  icon={ShieldCheck}
                />
                <StatsCard
                  title="Total Appointments"
                  value={statistics.totalAppointments}
                  icon={Calendar}
                />
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button className="h-auto py-6 flex flex-col items-center justify-center gap-2">
                    <Users className="h-6 w-6" />
                    <span>Manage Users</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-2">
                    <Briefcase className="h-6 w-6" />
                    <span>Manage Services</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-2">
                    <ShieldCheck className="h-6 w-6" />
                    <span>Review Certifications</span>
                  </Button>
                </div>
              </div>

              {/* Notary Management */}
              <div className="mt-8">
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All Notaries</TabsTrigger>
                    <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    <div className="space-y-4">
                      {notaries.map((notary) => (
                        <Card key={notary.id}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle>{notary.name}</CardTitle>
                              <Badge 
                                className={notary.isApproved ? 
                                  "bg-green-100 text-green-800" : 
                                  "bg-yellow-100 text-yellow-800"}
                              >
                                {notary.isApproved ? "Approved" : "Pending"}
                              </Badge>
                            </div>
                            <CardDescription>
                              {notary.email} • {notary.location}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between text-sm">
                              <div>
                                <span className="text-gray-500">Joined: </span>
                                <span>{notary.joinDate}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Services: </span>
                                <span>{notary.servicesCount}</span>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">View Details</Button>
                                {!notary.isApproved && (
                                  <Button 
                                    size="sm"
                                    onClick={() => handleApproveNotary(notary.id)}
                                  >
                                    Approve
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="pending">
                    <div className="space-y-4">
                      {notaries.filter(n => !n.isApproved).map((notary) => (
                        <Card key={notary.id}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle>{notary.name}</CardTitle>
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Pending
                              </Badge>
                            </div>
                            <CardDescription>
                              {notary.email} • {notary.location}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between text-sm">
                              <div>
                                <span className="text-gray-500">Joined: </span>
                                <span>{notary.joinDate}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Services: </span>
                                <span>{notary.servicesCount}</span>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">View Details</Button>
                                <Button 
                                  size="sm"
                                  onClick={() => handleApproveNotary(notary.id)}
                                >
                                  Approve
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {notaries.filter(n => !n.isApproved).length === 0 && (
                        <Card>
                          <CardContent className="py-8 text-center">
                            <p className="text-gray-500">
                              No pending notary approval requests
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return null;
}