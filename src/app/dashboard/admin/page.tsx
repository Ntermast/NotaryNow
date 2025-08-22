'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger, TabsContent, Tabs } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Users, Briefcase, ShieldCheck, BellIcon, SettingsIcon, CheckCircle, XCircle } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalNotaries: 0,
    pendingApprovals: 0,
    totalAppointments: 0,
    pendingCertifications: 0
  });
  const [notaries, setNotaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from API endpoints
  useEffect(() => {
    async function fetchAdminData() {
      if (status === "authenticated" && session?.user?.role === "ADMIN") {
        try {
          // Fetch statistics
          const statsResponse = await fetch('/api/admin/stats');
          if (!statsResponse.ok) throw new Error('Failed to fetch statistics');
          const statsData = await statsResponse.json();

          setStatistics({
            totalUsers: statsData.totalUsers || 0,
            totalNotaries: statsData.totalNotaries || 0,
            pendingApprovals: statsData.pendingApprovals || 0,
            totalAppointments: statsData.totalAppointments || 0,
            pendingCertifications: statsData.pendingCertifications || 0
          });

          // Fetch notaries
          const notariesResponse = await fetch('/api/admin/notaries');
          if (!notariesResponse.ok) throw new Error('Failed to fetch notaries');
          const notariesData = await notariesResponse.json();

          // Format notary data
          const formattedNotaries = notariesData.map((notary: any) => ({
            id: notary.id,
            name: notary.name,
            email: notary.email,
            isApproved: notary.isApproved,
            location: notary.location,
            joinDate: new Date(notary.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            servicesCount: notary.services.length
          }));

          setNotaries(formattedNotaries);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching admin data:', error);
          setLoading(false);
        }
      }
    }

    fetchAdminData();
  }, [status, session]);

  const handleApproveNotary = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/notaries/approve/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to approve notary');

      // Update local state
      setNotaries(prev =>
        prev.map(notary =>
          notary.id === id ? { ...notary, isApproved: true } : notary
        )
      );

      // Update the statistics
      setStatistics(prev => ({
        ...prev,
        pendingApprovals: Math.max(0, prev.pendingApprovals - 1)
      }));

      toast.success('Notary approved successfully');
    } catch (error) {
      console.error('Error approving notary:', error);
      toast.error('Failed to approve notary');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
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
              <Button
                className="h-auto py-6 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/dashboard/admin/users')}
              >
                <Users className="h-6 w-6" />
                <span>Manage Users</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/dashboard/admin/services')}
              >
                <Briefcase className="h-6 w-6" />
                <span>Manage Services</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/dashboard/admin/certifications')}
              >
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
                                <CheckCircle className="h-4 w-4 mr-1" />
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
                              <CheckCircle className="h-4 w-4 mr-1" />
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
    </>
  );
}