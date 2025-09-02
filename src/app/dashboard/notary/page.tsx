"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger, TabsContent, Tabs } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Calendar, Clock, BookOpen, BellIcon, SettingsIcon, DollarSign, Users, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";

export default function NotaryDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    revenue: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not authenticated or not a notary
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "NOTARY") {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    }
  }, [status, session, router]);

  useEffect(() => {
    async function fetchAppointments() {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/appointments");
          if (!response.ok) throw new Error("Failed to fetch appointments");
          
          const data = await response.json();
          setAppointments(data);
          
          // Calculate stats
          const totalAppointments = data.length;
          const pendingAppointments = data.filter(
            (app) => app.status === "PENDING"
          ).length;
          const completedAppointments = data.filter(
            (app) => app.status === "COMPLETED"
          ).length;
          const revenue = data
            .filter((app) => app.status === "COMPLETED")
            .reduce((sum, app) => sum + app.totalCost, 0);
          
          // Calculate average rating
          const ratings = data
            .filter((app) => app.reviews.length > 0)
            .map((app) => app.reviews[0].rating);
          const averageRating =
            ratings.length > 0
              ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
              : 0;
          
          setStats({
            totalAppointments,
            pendingAppointments,
            completedAppointments,
            revenue,
            averageRating,
          });
          
          setLoading(false);
        } catch (error) {
          console.error("Error fetching appointments:", error);
          setLoading(false);
        }
      }
    }

    fetchAppointments();
  }, [status]);

  const handleAppointmentStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update appointment");

      // Update the appointment in the local state
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "CONFIRMED": return "bg-green-100 text-green-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "COMPLETED": return "bg-blue-100 text-blue-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
                <h1 className="text-xl font-semibold">Notary Dashboard</h1>
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
                  title="Appointments"
                  value={stats.totalAppointments}
                  icon={Calendar}
                />
                <StatsCard
                  title="Pending Requests"
                  value={stats.pendingAppointments}
                  icon={Clock}
                />
                <StatsCard
                  title="Revenue"
                  value={`${stats.revenue.toLocaleString()} RWF`}
                  icon={DollarSign}
                />
                <StatsCard
                  title="Average Rating"
                  value={stats.averageRating.toFixed(1)}
                  icon={Star}
                />
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button
                    className="h-auto py-6 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/dashboard/notary/settings?tab=schedule')}
                  >
                    <Calendar className="h-6 w-6" />
                    <span>Manage Schedule</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/dashboard/notary/customers')}
                  >
                    <Users className="h-6 w-6" />
                    <span>View Customers</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/dashboard/notary/services')}
                  >
                    <BookOpen className="h-6 w-6" />
                    <span>Service Offerings</span>
                  </Button>
                </div>
              </div>

              {/* Appointments */}
              <div className="mt-8">
                <Tabs defaultValue="pending">
                  <TabsList className="mb-4">
                    <TabsTrigger value="pending">Pending Requests</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pending">
                    <div className="space-y-4">
                      {appointments
                        .filter((app) => app.status === "PENDING")
                        .map((appointment) => (
                          <Card key={appointment.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle>{appointment.service.name}</CardTitle>
                                <Badge 
                                  className={getStatusBadgeClass(appointment.status)}>
                                  Pending
                                </Badge>
                              </div>
                              <CardDescription>
                                Customer: {appointment.customer.name}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-2">
                                <div className="flex items-center text-sm">
                                  <Calendar className="mr-2 h-4 w-4 opacity-70" />
                                  <span>
                                    {new Date(
                                      appointment.scheduledTime
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Clock className="mr-2 h-4 w-4 opacity-70" />
                                  <span>
                                    {new Date(
                                      appointment.scheduledTime
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm font-semibold">
                                  <span>Fee: {appointment.totalCost.toLocaleString()} RWF</span>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="border-t pt-4 flex justify-between">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => 
                                  handleAppointmentStatusChange(
                                    appointment.id, 
                                    "CANCELLED"
                                  )
                                }
                              >
                                Decline
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => 
                                  handleAppointmentStatusChange(
                                    appointment.id, 
                                    "CONFIRMED"
                                  )
                                }
                              >
                                Accept
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}

                      {appointments.filter(
                        (app) => app.status === "PENDING"
                      ).length === 0 && (
                        <Card>
                          <CardContent className="py-8 text-center">
                            <p className="text-gray-500">
                              No pending appointment requests
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="upcoming">
                    <div className="space-y-4">
                      {appointments
                        .filter((app) => app.status === "CONFIRMED")
                        .map((appointment) => (
                          <Card key={appointment.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle>{appointment.service.name}</CardTitle>
                                <Badge
                                  className={getStatusBadgeClass(appointment.status)}
                                >
                                  Approved
                                </Badge>
                              </div>
                              <CardDescription>
                                Customer: {appointment.customer.name}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-2">
                                <div className="flex items-center text-sm">
                                  <Calendar className="mr-2 h-4 w-4 opacity-70" />
                                  <span>
                                    {new Date(
                                      appointment.scheduledTime
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Clock className="mr-2 h-4 w-4 opacity-70" />
                                  <span>
                                    {new Date(
                                      appointment.scheduledTime
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm font-semibold">
                                  <span>Fee: {appointment.totalCost.toLocaleString()} RWF</span>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="border-t pt-4 flex justify-between">
                              <Button 
                                variant="outline" 
                                size="sm"
                              >
                                Reschedule
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => 
                                  handleAppointmentStatusChange(
                                    appointment.id, 
                                    "COMPLETED"
                                  )
                                }
                              >
                                Mark as Completed
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}

                      {appointments.filter(
                        (app) => app.status === "CONFIRMED"
                      ).length === 0 && (
                        <Card>
                          <CardContent className="py-8 text-center">
                            <p className="text-gray-500">
                              No upcoming appointments
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="completed">
                    <div className="space-y-4">
                      {appointments
                        .filter((app) => app.status === "COMPLETED")
                        .map((appointment) => (
                          <Card key={appointment.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle>{appointment.service.name}</CardTitle>
                                <Badge
                                  className={getStatusBadgeClass(appointment.status)}
                                >
                                  Completed
                                </Badge>
                              </div>
                              <CardDescription>
                                Customer: {appointment.customer.name}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-2">
                                <div className="flex items-center text-sm">
                                  <Calendar className="mr-2 h-4 w-4 opacity-70" />
                                  <span>
                                    {new Date(
                                      appointment.scheduledTime
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Clock className="mr-2 h-4 w-4 opacity-70" />
                                  <span>
                                    {new Date(
                                      appointment.scheduledTime
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm font-semibold">
                                  <span>Fee: {appointment.totalCost.toLocaleString()} RWF</span>
                                </div>
                                {appointment.reviews.length > 0 && (
                                  <div className="flex items-center mt-2">
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map((starIndex) => (
                                        <Star
                                          key={starIndex}
                                          className={`h-4 w-4 ${
                                            starIndex <= appointment.reviews[0].rating
                                              ? "text-yellow-400 fill-yellow-400"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="ml-2 text-sm">
                                      {appointment.reviews[0].comment}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter className="border-t pt-4">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="w-full"
                              >
                                View Details
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}

                      {appointments.filter(
                        (app) => app.status === "COMPLETED"
                      ).length === 0 && (
                        <Card>
                          <CardContent className="py-8 text-center">
                            <p className="text-gray-500">
                              No completed appointments
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