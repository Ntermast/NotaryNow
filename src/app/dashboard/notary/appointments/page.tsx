'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger, TabsContent, Tabs } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Calendar, Clock, BellIcon, SettingsIcon } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function NotaryAppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated or not a notary
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "NOTARY") {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    }
  }, [status, session, router]);

  // Fetch appointments from API
  useEffect(() => {
    async function fetchAppointments() {
      if (status === "authenticated") {
        try {
          const response = await fetch('/api/appointments');
          if (!response.ok) throw new Error('Failed to fetch appointments');
          
          const data = await response.json();
          setAppointments(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching appointments:', error);
          setLoading(false);
          toast.error('Failed to fetch appointments');
        }
      }
    }
    
    fetchAppointments();
  }, [status]);

  const handleAppointmentStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update appointment');
      
      // Update local state
      const updatedAppointment = await response.json();
      
      setAppointments(prev => 
        prev.map(app => app.id === id ? updatedAppointment : app)
      );
      
      toast.success(`Appointment ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "authenticated" && session.user.role === "NOTARY") {
    // Filter appointments by status
    const pendingAppointments = appointments.filter(app => app.status === 'PENDING');
    const upcomingAppointments = appointments.filter(app => app.status === 'CONFIRMED');
    const completedAppointments = appointments.filter(app => app.status === 'COMPLETED');
    const otherAppointments = appointments.filter(app => 
      !['PENDING', 'CONFIRMED', 'COMPLETED'].includes(app.status)
    );

    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar 
          userRole="notary" 
          userName={session.user.name} 
          userEmail={session.user.email}
          pendingCount={pendingAppointments.length}
        />

        <div className="md:pl-64 flex flex-col flex-1">
          {/* Top navbar */}
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
            <div className="flex flex-1 justify-between px-4 md:px-6">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">Appointments</h1>
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">Your Appointments</h2>
                <div className="flex gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {pendingAppointments.length} Pending
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    {upcomingAppointments.length} Upcoming
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    {completedAppointments.length} Completed
                  </Badge>
                </div>
              </div>

              {/* Appointments */}
              <div>
                <Tabs defaultValue="pending">
                  <TabsList className="mb-4">
                    <TabsTrigger value="pending">
                      Pending Requests {pendingAppointments.length > 0 && `(${pendingAppointments.length})`}
                    </TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="other">Cancelled/Denied</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="pending">
                    <div className="space-y-4">
                      {pendingAppointments.length > 0 ? (
                        pendingAppointments.map((appointment) => (
                          <Card key={appointment.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle>{appointment.service.name}</CardTitle>
                                <Badge 
                                  className={getStatusBadgeClass(appointment.status)}>
                                  {appointment.status}
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
                                  <span>{formatDate(appointment.scheduledTime)}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Clock className="mr-2 h-4 w-4 opacity-70" />
                                  <span>{formatTime(appointment.scheduledTime)}</span>
                                </div>
                                <div className="flex items-center text-sm font-semibold">
                                  <span>Fee: {appointment.totalCost.toLocaleString()} RWF</span>
                                </div>
                                {appointment.notes && (
                                  <div className="text-sm mt-2">
                                    <span className="font-medium">Notes: </span>
                                    <span>{appointment.notes}</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter className="border-t pt-4 flex justify-between">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleAppointmentStatusChange(appointment.id, "CANCELLED")}
                              >
                                Decline
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleAppointmentStatusChange(appointment.id, "CONFIRMED")}
                              >
                                Accept
                              </Button>
                            </CardFooter>
                          </Card>
                        ))
                      ) : (
                        <Card>
                          <CardContent className="py-8 text-center">
                            <p className="text-gray-500">No pending appointment requests</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="upcoming">
                    <div className="space-y-4">
                      {upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map((appointment) => (
                          <Card key={appointment.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle>{appointment.service.name}</CardTitle>
                                <Badge className={getStatusBadgeClass(appointment.status)}>
                                  {appointment.status}
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
                                  <span>{formatDate(appointment.scheduledTime)}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Clock className="mr-2 h-4 w-4 opacity-70" />
                                  <span>{formatTime(appointment.scheduledTime)}</span>
                                </div>
                                <div className="flex items-center text-sm font-semibold">
                                  <span>Fee: {appointment.totalCost.toLocaleString()} RWF</span>
                                </div>
                                {appointment.notes && (
                                  <div className="text-sm mt-2">
                                    <span className="font-medium">Notes: </span>
                                    <span>{appointment.notes}</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter className="border-t pt-4 flex justify-between">
                              <Button 
                                variant="outline" 
                                size="sm"
                              >
                                Contact Customer
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleAppointmentStatusChange(appointment.id, "COMPLETED")}
                              >
                                Mark as Completed
                              </Button>
                            </CardFooter>
                          </Card>
                        ))
                      ) : (
                        <Card>
                          <CardContent className="py-8 text-center">
                            <p className="text-gray-500">No upcoming appointments</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="completed">
                    <div className="space-y-4">
                      {completedAppointments.length > 0 ? (
                        completedAppointments.map((appointment) => (
                          <Card key={appointment.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle>{appointment.service.name}</CardTitle>
                                <Badge className={getStatusBadgeClass(appointment.status)}>
                                  {appointment.status}
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
                                  <span>{formatDate(appointment.scheduledTime)}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Clock className="mr-2 h-4 w-4 opacity-70" />
                                  <span>{formatTime(appointment.scheduledTime)}</span>
                                </div>
                                <div className="flex items-center text-sm font-semibold">
                                  <span>Fee: {appointment.totalCost.toLocaleString()} RWF</span>
                                </div>
                                {appointment.reviews && appointment.reviews.length > 0 && (
                                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                    <div className="flex items-center mb-1">
                                      <span className="font-medium text-sm">Customer Rating: </span>
                                      <div className="flex ml-2">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                          <svg
                                            key={i}
                                            className={`h-4 w-4 ${
                                              i < appointment.reviews[0].rating
                                                ? "text-yellow-400 fill-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                          >
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                          </svg>
                                        ))}
                                      </div>
                                    </div>
                                    {appointment.reviews[0].comment && (
                                      <p className="text-sm italic text-gray-600">"{appointment.reviews[0].comment}"</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter className="border-t pt-4 flex justify-end">
                              <Button 
                                variant="outline" 
                                size="sm"
                              >
                                View Details
                              </Button>
                            </CardFooter>
                          </Card>
                        ))
                      ) : (
                        <Card>
                          <CardContent className="py-8 text-center">
                            <p className="text-gray-500">No completed appointments</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="other">
                    <div className="space-y-4">
                      {otherAppointments.length > 0 ? (
                        otherAppointments.map((appointment) => (
                          <Card key={appointment.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle>{appointment.service.name}</CardTitle>
                                <Badge className={getStatusBadgeClass(appointment.status)}>
                                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
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
                                  <span>{formatDate(appointment.scheduledTime)}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Clock className="mr-2 h-4 w-4 opacity-70" />
                                  <span>{formatTime(appointment.scheduledTime)}</span>
                                </div>
                                <div className="flex items-center text-sm font-semibold">
                                  <span>Fee: {appointment.totalCost.toLocaleString()} RWF</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Card>
                          <CardContent className="py-8 text-center">
                            <p className="text-gray-500">No cancelled or denied appointments</p>
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