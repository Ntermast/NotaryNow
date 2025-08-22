// src/app/dashboard/admin/reports/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sidebar } from '@/components/layout/sidebar';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar, 
  Download, 
  BarChart3, 
  PieChart,
  Activity,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data for admin reports
const generateMockAdminData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  return {
    overview: {
      totalRevenue: 48750,
      totalAppointments: 892,
      activeNotaries: 45,
      totalCustomers: 312,
      averageRating: 4.6,
      monthlyGrowth: 12.5
    },
    monthlyData: months.map((month) => ({
      month,
      revenue: Math.floor(Math.random() * 10000) + 5000,
      appointments: Math.floor(Math.random() * 150) + 50,
      newCustomers: Math.floor(Math.random() * 30) + 10,
      activeNotaries: Math.floor(Math.random() * 10) + 35,
    })),
    serviceBreakdown: [
      { name: 'Deed Notarization', revenue: 15750, percentage: 32, appointments: 285 },
      { name: 'Power of Attorney', revenue: 12200, percentage: 25, appointments: 203 },
      { name: 'Mortgage Signing', revenue: 9750, percentage: 20, appointments: 156 },
      { name: 'Affidavit', revenue: 6825, percentage: 14, appointments: 137 },
      { name: 'Other Services', revenue: 4225, percentage: 9, appointments: 111 }
    ],
    topNotaries: [
      { name: 'Sarah Johnson', revenue: 8950, appointments: 65, rating: 4.9 },
      { name: 'Michael Chen', revenue: 7280, appointments: 52, rating: 4.8 },
      { name: 'Emily Davis', revenue: 6940, appointments: 48, rating: 4.7 },
      { name: 'Robert Wilson', revenue: 6120, appointments: 44, rating: 4.8 },
      { name: 'Lisa Anderson', revenue: 5850, appointments: 41, rating: 4.6 }
    ],
    appointmentStats: {
      pending: 28,
      confirmed: 145,
      completed: 687,
      cancelled: 32
    }
  };
};

const mockData = generateMockAdminData();

export default function AdminReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('6months');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated") {
      setLoading(false);
    }
  }, [status]);

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    toast.info(`Showing data for ${range.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
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

  if (status === "authenticated" && session.user.role === "ADMIN") {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar 
          userRole="admin" 
          userName={session.user.name} 
          userEmail={session.user.email} 
        />

        <div className="md:pl-64 flex flex-col flex-1">
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
            <div className="flex flex-1 justify-between px-4 md:px-6">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">Analytics & Reports</h1>
              </div>
              <div className="flex items-center gap-4">
                <Select value={dateRange} onValueChange={handleDateRangeChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleExportReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          <main className="flex-1 p-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">${mockData.overview.totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-green-600">+{mockData.overview.monthlyGrowth}% from last period</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                      <p className="text-2xl font-bold text-gray-900">{mockData.overview.totalAppointments}</p>
                      <p className="text-xs text-blue-600">+8.5% from last period</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Notaries</p>
                      <p className="text-2xl font-bold text-gray-900">{mockData.overview.activeNotaries}</p>
                      <p className="text-xs text-purple-600">+3 this month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                      <p className="text-2xl font-bold text-gray-900">{mockData.overview.averageRating}</p>
                      <p className="text-xs text-yellow-600">+0.2 from last period</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Business Overview</TabsTrigger>
                <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Monthly Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Monthly Trends
                      </CardTitle>
                      <CardDescription>Revenue and appointments over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="py-2 text-left">Month</th>
                              <th className="py-2 text-right">Revenue</th>
                              <th className="py-2 text-right">Appointments</th>
                              <th className="py-2 text-right">Growth</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mockData.monthlyData.map((item, index) => (
                              <tr key={index} className="border-b">
                                <td className="py-2">{item.month}</td>
                                <td className="py-2 text-right">${item.revenue.toLocaleString()}</td>
                                <td className="py-2 text-right">{item.appointments}</td>
                                <td className="py-2 text-right text-green-600">
                                  +{((item.revenue / (mockData.monthlyData[0]?.revenue || 1) - 1) * 100).toFixed(1)}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Appointment Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Appointment Status
                      </CardTitle>
                      <CardDescription>Current appointment breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Completed</span>
                          </div>
                          <span className="font-semibold">{mockData.appointmentStats.completed}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span>Confirmed</span>
                          </div>
                          <span className="font-semibold">{mockData.appointmentStats.confirmed}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <span>Pending</span>
                          </div>
                          <span className="font-semibold">{mockData.appointmentStats.pending}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-red-600" />
                            <span>Cancelled</span>
                          </div>
                          <span className="font-semibold">{mockData.appointmentStats.cancelled}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="revenue" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Service Revenue Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Revenue by Service
                      </CardTitle>
                      <CardDescription>Service type performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockData.serviceBreakdown.map((service, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{service.name}</span>
                              <div className="text-right">
                                <div className="text-sm font-bold">${service.revenue.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">{service.appointments} appointments</div>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${service.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Performing Notaries */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Top Performing Notaries
                      </CardTitle>
                      <CardDescription>Highest revenue generators</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockData.topNotaries.map((notary, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium">{notary.name}</div>
                                <div className="text-sm text-gray-500">
                                  {notary.appointments} appointments • ⭐ {notary.rating}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">${notary.revenue.toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Satisfaction</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">96.5%</div>
                      <p className="text-sm text-gray-600">Average satisfaction rating</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600">94.2%</div>
                      <p className="text-sm text-gray-600">Appointments completed successfully</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Average Response Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-600">2.5h</div>
                      <p className="text-sm text-gray-600">From booking to confirmation</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Metrics Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 text-left">Metric</th>
                            <th className="py-2 text-right">Current Period</th>
                            <th className="py-2 text-right">Previous Period</th>
                            <th className="py-2 text-right">Change</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2">Total Bookings</td>
                            <td className="py-2 text-right">892</td>
                            <td className="py-2 text-right">823</td>
                            <td className="py-2 text-right text-green-600">+8.4%</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">Cancellation Rate</td>
                            <td className="py-2 text-right">3.6%</td>
                            <td className="py-2 text-right">4.1%</td>
                            <td className="py-2 text-right text-green-600">-0.5%</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">Average Revenue per Appointment</td>
                            <td className="py-2 text-right">$54.65</td>
                            <td className="py-2 text-right">$52.30</td>
                            <td className="py-2 text-right text-green-600">+4.5%</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">Customer Retention Rate</td>
                            <td className="py-2 text-right">78.2%</td>
                            <td className="py-2 text-right">75.8%</td>
                            <td className="py-2 text-right text-green-600">+2.4%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appointments" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Appointment Volume</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                          const volume = Math.floor(Math.random() * 40) + 10;
                          const percentage = (volume / 50) * 100;
                          return (
                            <div key={day} className="flex items-center justify-between">
                              <span className="text-sm font-medium w-20">{day}</span>
                              <div className="flex-1 mx-4">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                              <span className="text-sm font-semibold w-8 text-right">{volume}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Peak Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { time: '9:00 AM - 10:00 AM', appointments: 45 },
                          { time: '10:00 AM - 11:00 AM', appointments: 52 },
                          { time: '2:00 PM - 3:00 PM', appointments: 38 },
                          { time: '3:00 PM - 4:00 PM', appointments: 41 },
                          { time: '7:00 PM - 8:00 PM', appointments: 28 }
                        ].map((slot, index) => {
                          const percentage = (slot.appointments / 52) * 100;
                          return (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm font-medium">{slot.time}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-semibold w-8 text-right">{slot.appointments}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    );
  }

  return null;
}