// src/app/dashboard/admin/appointments/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Search, Filter, CheckCircle, Clock, AlertCircle, Eye, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Appointment {
  id: string;
  customer: { name: string; email: string };
  notary: { name: string; email: string };
  service: { name: string; basePrice: number };
  scheduledTime: string;
  status: string;
  notes?: string;
  totalCost: number;
  createdAt: string;
}

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  todayAppointments: number;
}

export default function AdminAppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
    todayAppointments: 0
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    }
  }, [status, session, router]);

  useEffect(() => {
    async function fetchAppointments() {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/appointments");
          if (response.ok) {
            const data = await response.json();
            setAppointments(data);
            setFilteredAppointments(data);
            
            // Calculate stats
            const today = new Date().toDateString();
            const calculatedStats = {
              total: data.length,
              pending: data.filter((apt: Appointment) => apt.status === "pending").length,
              confirmed: data.filter((apt: Appointment) => apt.status === "confirmed").length,
              completed: data.filter((apt: Appointment) => apt.status === "completed").length,
              cancelled: data.filter((apt: Appointment) => apt.status === "cancelled").length,
              totalRevenue: data.filter((apt: Appointment) => apt.status === "completed")
                .reduce((sum: number, apt: Appointment) => sum + apt.totalCost, 0),
              todayAppointments: data.filter((apt: Appointment) => 
                new Date(apt.scheduledTime).toDateString() === today).length
            };
            setStats(calculatedStats);
          }
        } catch (error) {
          console.error("Error fetching appointments:", error);
          toast.error("Failed to load appointments");
        } finally {
          setLoading(false);
        }
      }
    }

    fetchAppointments();
  }, [status]);

  useEffect(() => {
    let filtered = appointments;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((apt) =>
        apt.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.notary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.service.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== "ALL") {
      const today = new Date();
      
      switch (dateFilter) {
        case "TODAY":
          filtered = filtered.filter((apt) => 
            new Date(apt.scheduledTime).toDateString() === today.toDateString()
          );
          break;
        case "WEEK":
          const weekAhead = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((apt) => {
            const appointmentDate = new Date(apt.scheduledTime);
            return appointmentDate >= today && appointmentDate <= weekAhead;
          });
          break;
        case "PAST":
          filtered = filtered.filter((apt) => new Date(apt.scheduledTime) < today);
          break;
      }
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchQuery, statusFilter, dateFilter]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      confirmed: { variant: "default", icon: CheckCircle },
      pending: { variant: "secondary", icon: Clock },
      completed: { variant: "outline", icon: CheckCircle },
      cancelled: { variant: "destructive", icon: AlertCircle }
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentId ? { ...apt, status: newStatus } : apt
          )
        );
        toast.success("Appointment status updated successfully");
      } else {
        toast.error("Failed to update appointment status");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Failed to update appointment status");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "authenticated" && session.user.role === "ADMIN") {
    return (
      <>
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
            <div className="flex flex-1 justify-between px-4 md:px-6">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">Appointments Management</h1>
              </div>
            </div>
          </div>

          <main className="flex-1 p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CalendarDays className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Today</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Appointments ({stats.total})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed ({stats.confirmed})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {/* Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filters & Search
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Search</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search customers, notaries..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date Range</label>
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Dates</SelectItem>
                            <SelectItem value="TODAY">Today</SelectItem>
                            <SelectItem value="WEEK">Next 7 Days</SelectItem>
                            <SelectItem value="PAST">Past Appointments</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-end">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("ALL");
                            setDateFilter("ALL");
                          }}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Appointments List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Appointments ({filteredAppointments.length})</CardTitle>
                    <CardDescription>Manage and track all appointment requests system-wide</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {filteredAppointments.map((appointment) => (
                          <div key={appointment.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {new Date(appointment.scheduledTime).toLocaleDateString()} at {new Date(appointment.scheduledTime).toLocaleTimeString()}
                                  </span>
                                  {getStatusBadge(appointment.status)}
                                  <Badge variant="outline">${appointment.totalCost.toFixed(2)}</Badge>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                                  <div>
                                    <div className="text-sm font-medium text-muted-foreground">Customer</div>
                                    <div className="font-medium">{appointment.customer.name}</div>
                                    <div className="text-sm text-muted-foreground">{appointment.customer.email}</div>
                                  </div>
                                  
                                  <div>
                                    <div className="text-sm font-medium text-muted-foreground">Notary</div>
                                    <div className="font-medium">{appointment.notary.name}</div>
                                    <div className="text-sm text-muted-foreground">{appointment.notary.email}</div>
                                  </div>
                                  
                                  <div>
                                    <div className="text-sm font-medium text-muted-foreground">Service</div>
                                    <div className="font-medium">{appointment.service.name}</div>
                                    <div className="text-sm text-muted-foreground">Base: ${appointment.service.basePrice}</div>
                                  </div>
                                </div>

                                {appointment.notes && (
                                  <div className="mt-3">
                                    <div className="text-sm font-medium text-muted-foreground">Notes</div>
                                    <div className="text-sm">{appointment.notes}</div>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-2 ml-4">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                                
                                {appointment.status === "pending" && (
                                  <div className="flex gap-1">
                                    <Button 
                                      size="sm" 
                                      onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                                    >
                                      Confirm
                                    </Button>
                                    <Button 
                                      variant="outline"
                                      size="sm" 
                                      onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                )}

                                {appointment.status === "confirmed" && (
                                  <Button 
                                    variant="outline"
                                    size="sm" 
                                    onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                                  >
                                    Mark Complete
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        {searchQuery || statusFilter !== "ALL" || dateFilter !== "ALL" 
                          ? "No appointments match your current filters"
                          : "No appointments found"
                        }
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Status-specific tab content */}
              {["pending", "confirmed", "completed"].map((tabStatus) => (
                <TabsContent key={tabStatus} value={tabStatus}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{tabStatus.charAt(0).toUpperCase() + tabStatus.slice(1)} Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {appointments.filter(apt => apt.status === tabStatus).map((appointment) => (
                          <div key={appointment.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {new Date(appointment.scheduledTime).toLocaleDateString()} at {new Date(appointment.scheduledTime).toLocaleTimeString()}
                                  </span>
                                  <Badge variant="outline">${appointment.totalCost.toFixed(2)}</Badge>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                                  <div>
                                    <div className="text-sm font-medium text-muted-foreground">Customer</div>
                                    <div className="font-medium">{appointment.customer.name}</div>
                                  </div>
                                  
                                  <div>
                                    <div className="text-sm font-medium text-muted-foreground">Notary</div>
                                    <div className="font-medium">{appointment.notary.name}</div>
                                  </div>
                                  
                                  <div>
                                    <div className="text-sm font-medium text-muted-foreground">Service</div>
                                    <div className="font-medium">{appointment.service.name}</div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 ml-4">
                                {appointment.status === "pending" && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                                    >
                                      Confirm
                                    </Button>
                                    <Button 
                                      variant="outline"
                                      size="sm" 
                                      onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                                    >
                                      Cancel
                                    </Button>
                                  </>
                                )}

                                {appointment.status === "confirmed" && (
                                  <Button 
                                    variant="outline"
                                    size="sm" 
                                    onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                                  >
                                    Mark Complete
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </main>
      </>
    );
  }

  return null;
}