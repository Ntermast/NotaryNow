'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger, TabsContent, Tabs } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, BellIcon, SettingsIcon } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { AppointmentCard } from '@/components/dashboard/appointment-card';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CustomerAppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [pastAppointments, setPastAppointments] = useState<any[]>([]);

  // Redirect if not authenticated or not a customer
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "CUSTOMER") {
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
          
          // Split appointments into upcoming and past
          const now = new Date();
          const upcoming = data.filter((app: any) => {
            const appDate = new Date(app.scheduledTime);
            return appDate >= now && app.status !== 'CANCELLED';
          });
          
          const past = data.filter((app: any) => {
            const appDate = new Date(app.scheduledTime);
            return appDate < now || app.status === 'CANCELLED';
          });
          
          setUpcomingAppointments(upcoming);
          setPastAppointments(past);
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

  const handleCancelAppointment = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (!response.ok) throw new Error('Failed to cancel appointment');
      
      // Update local state
      const updatedAppointment = await response.json();
      
      setAppointments(prev => 
        prev.map(app => app.id === id ? updatedAppointment : app)
      );
      
      // Move from upcoming to past appointments
      setUpcomingAppointments(prev => prev.filter(app => app.id !== id));
      setPastAppointments(prev => [...prev, updatedAppointment]);
      
      toast.success('Appointment cancelled successfully');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const handleRescheduleAppointment = (id: string) => {
    // This would open a reschedule dialog, which we'll leave as a future enhancement
    toast.info('Reschedule functionality is coming soon');
  };

  const handleReviewSubmit = async (id: string, rating: number, comment: string) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: id,
          rating,
          comment: comment || '',
        }),
      });

      if (!response.ok) throw new Error('Failed to submit review');
      
      // Update local state
      setPastAppointments(prev => 
        prev.map(app => 
          app.id === id ? { 
            ...app, 
            reviews: [...(app.reviews || []), { rating, comment, createdAt: new Date() }] 
          } : app
        )
      );
      
      toast.success('Review submitted successfully');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "authenticated" && session.user.role === "CUSTOMER") {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar 
          userRole="customer" 
          userName={session.user.name} 
          userEmail={session.user.email} 
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
                <Link href="/notaries">
                  <Button>
                    Schedule New Appointment
                  </Button>
                </Link>
              </div>

              {/* Appointments */}
              <div>
                <Tabs defaultValue="upcoming">
                  <TabsList className="mb-4">
                    <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
                    <TabsTrigger value="past">Past Appointments</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upcoming">
                    <div className="space-y-4">
                      {upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map((appointment) => (
                          <AppointmentCard 
                            key={appointment.id} 
                            appointment={{
                              id: appointment.id,
                              notaryName: appointment.notary.name,
                              service: appointment.service.name,
                              date: appointment.scheduledTime,
                              time: new Date(appointment.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              location: appointment.notary.notaryProfile ? 
                                `${appointment.notary.notaryProfile.city}, ${appointment.notary.notaryProfile.state}` : 
                                appointment.notes || 'Location not specified',
                              status: appointment.status,
                              cost: appointment.totalCost
                            }}
                            onCancel={appointment.status === 'PENDING' ? () => handleCancelAppointment(appointment.id) : undefined}
                            onReschedule={appointment.status === 'CONFIRMED' ? () => handleRescheduleAppointment(appointment.id) : undefined}
                          />
                        ))
                      ) : (
                        <Card>
                          <CardContent className="py-8 text-center">
                            <p className="text-gray-500">You have no upcoming appointments</p>
                            <Link href="/notaries">
                              <Button className="mt-4">Schedule an Appointment</Button>
                            </Link>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="past">
                    <div className="space-y-4">
                      {pastAppointments.length > 0 ? (
                        pastAppointments.map((appointment) => (
                          <AppointmentCard 
                            key={appointment.id} 
                            appointment={{
                              id: appointment.id,
                              notaryName: appointment.notary.name,
                              service: appointment.service.name,
                              date: appointment.scheduledTime,
                              time: new Date(appointment.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              location: appointment.notary.notaryProfile ? 
                                `${appointment.notary.notaryProfile.city}, ${appointment.notary.notaryProfile.state}` : 
                                appointment.notes || 'Location not specified',
                              status: appointment.status,
                              cost: appointment.totalCost,
                              rated: appointment.reviews && appointment.reviews.length > 0,
                              rating: appointment.reviews && appointment.reviews.length > 0 ? appointment.reviews[0].rating : undefined
                            }}
                            onReview={
                              appointment.status === 'COMPLETED' && (!appointment.reviews || appointment.reviews.length === 0) 
                                ? (_id: string | number, rating: number, comment: string) => handleReviewSubmit(appointment.id, rating, comment) 
                                : undefined
                            }
                          />
                        ))
                      ) : (
                        <Card>
                          <CardContent className="py-8 text-center">
                            <p className="text-gray-500">You have no past appointments</p>
                            <Link href="/notaries">
                              <Button className="mt-4">Find a Notary</Button>
                            </Link>
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