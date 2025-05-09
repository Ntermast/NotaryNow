'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger, TabsContent, Tabs } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, BellIcon, SettingsIcon } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { StatsCard } from '@/components/dashboard/stats-card';
import { AppointmentCard } from '@/components/dashboard/appointment-card';
import { QuickActions } from '@/components/dashboard/quick-actions';

// This would normally come from an API
const MOCK_UPCOMING_APPOINTMENTS = [
  {
    id: 1,
    notaryName: 'John Smith',
    service: 'Deed Notarization',
    date: '2025-03-05',
    time: '10:00 AM',
    location: '123 Main St, Suite 101',
    status: 'approved',
    cost: 45
  },
  {
    id: 2,
    notaryName: 'Sarah Johnson',
    service: 'Power of Attorney',
    date: '2025-03-10',
    time: '2:30 PM',
    location: '456 Oak Ave',
    status: 'pending',
    cost: 65
  }
];

const MOCK_PAST_APPOINTMENTS = [
  {
    id: 3,
    notaryName: 'Michael Brown',
    service: 'Mortgage Signing',
    date: '2025-02-15',
    time: '9:00 AM',
    location: '789 Pine Rd',
    status: 'completed',
    cost: 120,
    rated: true,
    rating: 5
  },
  {
    id: 4,
    notaryName: 'Emily Davis',
    service: 'Affidavit Notarization',
    date: '2025-02-01',
    time: '11:30 AM',
    location: '345 Maple St',
    status: 'completed',
    cost: 35,
    rated: false
  }
];

export default function CustomerDashboard() {
  const [upcomingAppointments, setUpcomingAppointments] = useState(MOCK_UPCOMING_APPOINTMENTS);
  const [pastAppointments, setPastAppointments] = useState(MOCK_PAST_APPOINTMENTS);

  const handleCancelAppointment = (id) => {
    // In a real app, this would make an API call
    console.log(`Cancelling appointment ${id}`);
    
    // Update local state to simulate API response
    setUpcomingAppointments(prev => 
      prev.map(app => 
        app.id === id ? { ...app, status: 'cancelled' } : app
      )
    );
  };

  const handleRescheduleAppointment = (id) => {
    // In a real app, this would open a reschedule dialog and make an API call
    console.log(`Rescheduling appointment ${id}`);
  };

  const handleReviewSubmit = (id, rating, comment) => {
    // In a real app, this would make an API call
    console.log(`Submitting review for appointment ${id}:`, { rating, comment });
    
    // Update local state to simulate API response
    setPastAppointments(prev => 
      prev.map(app => 
        app.id === id ? { ...app, rated: true, rating } : app
      )
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        userRole="customer" 
        userName="Jane Doe" 
        userEmail="jane.doe@example.com" 
      />

      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top navbar */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
          <div className="flex flex-1 justify-between px-4 md:px-6">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
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
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <StatsCard 
                title="Total Appointments" 
                value={upcomingAppointments.length + pastAppointments.length}
                icon={Calendar}
              />
              <StatsCard 
                title="Upcoming" 
                value={upcomingAppointments.length}
                icon={Clock}
              />
              <StatsCard 
                title="Pending Review" 
                value={pastAppointments.filter(a => !a.rated && a.status === 'completed').length}
                icon={Calendar}
              />
            </div>

            <QuickActions />

            {/* Appointments */}
            <div className="mt-8">
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
                          appointment={appointment}
                          onCancel={appointment.status === 'pending' ? handleCancelAppointment : undefined}
                          onReschedule={appointment.status === 'approved' ? handleRescheduleAppointment : undefined}
                        />
                      ))
                    ) : (
                      <Card>
                        <CardContent className="py-8 text-center">
                          <p className="text-gray-500">You have no upcoming appointments</p>
                          <Button className="mt-4">Schedule an Appointment</Button>
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
                          appointment={appointment}
                          onReview={!appointment.rated && appointment.status === 'completed' ? handleReviewSubmit : undefined}
                        />
                      ))
                    ) : (
                      <Card>
                        <CardContent className="py-8 text-center">
                          <p className="text-gray-500">You have no past appointments</p>
                          <Button className="mt-4">Find a Notary</Button>
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