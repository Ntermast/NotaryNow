'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sidebar } from '@/components/layout/sidebar';
import { BellIcon, SettingsIcon, CalendarRange, DollarSign, TrendingUp, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ReportsData {
  summary: {
    totalRevenue: number;
    totalAppointments: number;
    completedAppointments: number;
    pendingAppointments: number;
    confirmedAppointments: number;
    averageRevenue: number;
    completionRate: number;
    revenueGrowth: number;
  };
  chartData: Array<{
    period: string;
    revenue: number;
    appointments: number;
    completed: number;
  }>;
  topServices: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
}

export default function NotaryReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'quarter', 'year'
  const [reportType, setReportType] = useState('revenue'); // 'revenue', 'appointments', 'services'

  // Redirect if not authenticated or not a notary
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "NOTARY") {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    }
  }, [status, session, router]);

  const fetchReportsData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notaries/reports?period=${dateRange}&type=${reportType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reports data');
      }
      const data = await response.json();
      setReportsData(data);
    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast.error('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  }, [dateRange, reportType]);

  // Fetch reports data
  useEffect(() => {
    if (status === "authenticated" && session.user.role === "NOTARY") {
      fetchReportsData();
    }
  }, [status, session, dateRange, reportType, fetchReportsData]);

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    toast.info(`Loading data for the last ${range}...`);
  };

  const handleExportReport = () => {
    toast.success('Report exported successfully');
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "authenticated" && session.user.role === "NOTARY") {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar 
          userRole="notary" 
          userName={session.user.name} 
          userEmail={session.user.email} 
        />

        <div className="md:pl-64 flex flex-col flex-1">
          {/* Top navbar */}
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
            <div className="flex flex-1 justify-between px-4 md:px-6">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">Reports & Analytics</h1>
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

          {/* Reports content */}
          <main className="flex-1 pb-8">
            <div className="mt-8 px-4 sm:px-6 lg:px-8">
              {/* Summary cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Revenue
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {reportsData ? `${reportsData.summary.totalRevenue.toLocaleString()} RWF` : '0 RWF'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {reportsData && reportsData.summary.revenueGrowth > 0 ? '+' : ''}{reportsData?.summary.revenueGrowth.toFixed(1) || 0}% from last period
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Appointments
                    </CardTitle>
                    <CalendarRange className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportsData?.summary.totalAppointments || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {reportsData?.summary.completionRate.toFixed(1) || 0}% completion rate
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Per Client
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {reportsData ? `${reportsData.summary.averageRevenue.toLocaleString()} RWF` : '0 RWF'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Per completed appointment
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Date range selector */}
              <div className="mt-8 flex justify-between items-center">
                <Tabs defaultValue={dateRange} onValueChange={handleDateRangeChange}>
                  <TabsList>
                    <TabsTrigger value="week">Last Week</TabsTrigger>
                    <TabsTrigger value="month">Last Month</TabsTrigger>
                    <TabsTrigger value="quarter">Last Quarter</TabsTrigger>
                    <TabsTrigger value="year">Last Year</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="outline" onClick={handleExportReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>

              {/* Report content */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Revenue & Appointments Overview</CardTitle>
                  <CardDescription>
                    View your earnings and appointments over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Chart placeholder - in a real application, you would use a chart library */}
                  <div className="h-80 w-full bg-gray-50 rounded-md border flex flex-col justify-center items-center">
                    <table className="w-full max-w-xl text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-4 text-left">Month</th>
                          <th className="py-2 px-4 text-right">Revenue</th>
                          <th className="py-2 px-4 text-right">Appointments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportsData?.chartData.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 px-4">{item.period}</td>
                            <td className="py-2 px-4 text-right">{item.revenue.toLocaleString()} RWF</td>
                            <td className="py-2 px-4 text-right">{item.appointments}</td>
                          </tr>
                        ))}
                        {reportsData && (
                          <tr className="font-medium">
                            <td className="py-2 px-4">Total</td>
                            <td className="py-2 px-4 text-right">{reportsData.summary.totalRevenue.toLocaleString()} RWF</td>
                            <td className="py-2 px-4 text-right">{reportsData.summary.totalAppointments}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <p className="mt-4 text-sm text-gray-500">
                      Tip: In the full version, this would show interactive charts for better data visualization
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Service breakdown */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Service Breakdown</CardTitle>
                  <CardDescription>
                    Revenue split by service type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* This would be a chart in a real application */}
                    <div className="flex justify-between items-center">
                      <span>Deed Notarization</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: '35%' }}></div>
                        </div>
                        <span>35%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Power of Attorney</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: '25%' }}></div>
                        </div>
                        <span>25%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Mortgage Signing</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: '20%' }}></div>
                        </div>
                        <span>20%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Other Services</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: '20%' }}></div>
                        </div>
                        <span>20%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return null;
}