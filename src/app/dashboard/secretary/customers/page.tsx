// src/app/dashboard/secretary/customers/page.tsx
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
import { Users, Search, Filter, Mail, Phone, Calendar, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  totalAppointments?: number;
  lastAppointment?: string;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  appointments?: Array<{
    id: string;
    date: string;
    status: string;
    service: { name: string };
    notary: { name: string };
  }>;
}

export default function SecretaryCustomers() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activityFilter, setActivityFilter] = useState("ALL");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "SECRETARY") {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    }
  }, [status, session, router]);

  useEffect(() => {
    async function fetchCustomers() {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/admin/users?role=CUSTOMER");
          if (response.ok) {
            const data = await response.json();
            
            // Transform the data to match our interface
            const customersWithStats = data.map((user: any) => ({
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              createdAt: user.createdAt,
              status: "ACTIVE", // Default status
              totalAppointments: user.appointments?.length || 0,
              lastAppointment: user.appointments?.length > 0 
                ? user.appointments[user.appointments.length - 1]?.date 
                : undefined,
              appointments: user.appointments || []
            }));
            
            setCustomers(customersWithStats);
            setFilteredCustomers(customersWithStats);
          }
        } catch (error) {
          console.error("Error fetching customers:", error);
          toast.error("Failed to load customers");
        } finally {
          setLoading(false);
        }
      }
    }

    fetchCustomers();
  }, [status]);

  useEffect(() => {
    let filtered = customers;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((customer) =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((customer) => customer.status === statusFilter);
    }

    // Apply activity filter
    if (activityFilter !== "ALL") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      switch (activityFilter) {
        case "RECENT":
          filtered = filtered.filter((customer) => 
            customer.lastAppointment && new Date(customer.lastAppointment) >= thirtyDaysAgo
          );
          break;
        case "INACTIVE":
          filtered = filtered.filter((customer) => 
            !customer.lastAppointment || new Date(customer.lastAppointment) < thirtyDaysAgo
          );
          break;
        case "NEW":
          filtered = filtered.filter((customer) => 
            new Date(customer.createdAt) >= thirtyDaysAgo
          );
          break;
      }
    }

    setFilteredCustomers(filtered);
  }, [customers, searchQuery, statusFilter, activityFilter]);

  const getActivityStatus = (customer: Customer) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (new Date(customer.createdAt) >= thirtyDaysAgo) {
      return <Badge variant="default">New Customer</Badge>;
    }

    if (customer.lastAppointment && new Date(customer.lastAppointment) >= thirtyDaysAgo) {
      return <Badge variant="outline">Recently Active</Badge>;
    }

    return <Badge variant="secondary">Inactive</Badge>;
  };

  const contactCustomer = (customer: Customer) => {
    const subject = encodeURIComponent("NotaryAvailability Support");
    const body = encodeURIComponent(`Dear ${customer.name},\n\nWe hope this message finds you well. We're reaching out to assist you with any questions or concerns you may have regarding our notary services.\n\nBest regards,\nNotaryAvailability Support Team`);
    window.open(`mailto:${customer.email}?subject=${subject}&body=${body}`, '_blank');
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
                <h1 className="text-xl font-semibold">Customer Support</h1>
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
                        placeholder="Search customers..."
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
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="BLOCKED">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Activity</label>
                    <Select value={activityFilter} onValueChange={setActivityFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Activity</SelectItem>
                        <SelectItem value="RECENT">Recently Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="NEW">New Customers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("ALL");
                        setActivityFilter("ALL");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customers List */}
            <Card>
              <CardHeader>
                <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
                <CardDescription>Manage customer relationships and support</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredCustomers.length > 0 ? (
                  <div className="space-y-4">
                    {filteredCustomers.map((customer) => (
                      <div key={customer.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{customer.name}</h3>
                              {getActivityStatus(customer)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  <span>{customer.email}</span>
                                </div>
                                
                                {customer.phone && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{customer.phone}</span>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span>Joined {new Date(customer.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="text-sm">
                                  <span className="font-medium">Total Appointments:</span> {customer.totalAppointments}
                                </div>
                                
                                {customer.lastAppointment && (
                                  <div className="text-sm">
                                    <span className="font-medium">Last Appointment:</span>{" "}
                                    {new Date(customer.lastAppointment).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Recent Appointments */}
                            {customer.appointments && customer.appointments.length > 0 && (
                              <div className="mt-3 p-3 bg-muted rounded-lg">
                                <div className="text-sm font-medium mb-2">Recent Appointments:</div>
                                <div className="space-y-1">
                                  {customer.appointments.slice(0, 3).map((appointment) => (
                                    <div key={appointment.id} className="text-sm flex items-center justify-between">
                                      <span>
                                        {appointment.service.name} with {appointment.notary.name}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {new Date(appointment.date).toLocaleDateString()}
                                      </span>
                                    </div>
                                  ))}
                                  {customer.appointments.length > 3 && (
                                    <div className="text-sm text-muted-foreground">
                                      +{customer.appointments.length - 3} more appointments
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => contactCustomer(customer)}
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Contact
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => router.push(`/dashboard/secretary/customers/${customer.id}`)}
                            >
                              View Details
                            </Button>

                            {customer.phone && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(`tel:${customer.phone}`, '_blank')}
                              >
                                <Phone className="h-4 w-4 mr-1" />
                                Call
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery || statusFilter !== "ALL" || activityFilter !== "ALL"
                      ? "No customers match your current filters"
                      : "No customers found"
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