// src/app/dashboard/secretary/appointments/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Search, Filter, CheckCircle, Clock, AlertCircle, Eye } from "lucide-react";
import { toast } from "sonner";

interface Appointment {
  id: string;
  customer: { name: string; email: string };
  notary: { name: string; email: string };
  service: { name: string };
  date: string;
  time: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export default function SecretaryAppointments() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "SECRETARY") {
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
      const appointmentDate = new Date(apt.date);
      
      switch (dateFilter) {
        case "TODAY":
          filtered = filtered.filter((apt) => 
            new Date(apt.date).toDateString() === today.toDateString()
          );
          break;
        case "WEEK":
          const weekAhead = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((apt) => {
            const appointmentDate = new Date(apt.date);
            return appointmentDate >= today && appointmentDate <= weekAhead;
          });
          break;
        case "PAST":
          filtered = filtered.filter((apt) => new Date(apt.date) < today);
          break;
      }
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchQuery, statusFilter, dateFilter]);

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
                <h1 className="text-xl font-semibold">Appointments Management</h1>
              </div>
            </div>
          </div>

          <main className="flex-1 p-6">
            {/* Filters */}
            <Card className="mb-6">
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
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
                <CardDescription>Manage and track all appointment requests</CardDescription>
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
                                {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                              </span>
                              {getStatusBadge(appointment.status)}
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
                            
                            {appointment.status === "PENDING" && (
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  onClick={() => updateAppointmentStatus(appointment.id, "CONFIRMED")}
                                >
                                  Confirm
                                </Button>
                                <Button 
                                  variant="outline"
                                  size="sm" 
                                  onClick={() => updateAppointmentStatus(appointment.id, "CANCELLED")}
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}

                            {appointment.status === "CONFIRMED" && (
                              <Button 
                                variant="outline"
                                size="sm" 
                                onClick={() => updateAppointmentStatus(appointment.id, "COMPLETED")}
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
          </main>
        </div>
      </div>
    );
  }

  return null;
}