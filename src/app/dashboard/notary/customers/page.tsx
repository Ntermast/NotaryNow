'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sidebar } from '@/components/layout/sidebar';
import { BellIcon, SettingsIcon, Search, UserRound, Phone, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';

// Mock customer data - would be fetched from the API in a real application
const MOCK_CUSTOMERS = [
  {
    id: '1',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '(555) 123-4567',
    appointmentsCount: 3,
    lastAppointment: '2025-03-01T14:30:00Z'
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 987-6543',
    appointmentsCount: 1,
    lastAppointment: '2025-02-15T10:00:00Z'
  },
  {
    id: '3',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '(555) 567-8901',
    appointmentsCount: 2,
    lastAppointment: '2025-02-28T16:45:00Z'
  },
  {
    id: '4',
    name: 'Robert Williams',
    email: 'robert.williams@example.com',
    phone: '(555) 234-5678',
    appointmentsCount: 1,
    lastAppointment: '2025-01-20T09:15:00Z'
  }
];

export default function NotaryCustomersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [filteredCustomers, setFilteredCustomers] = useState(MOCK_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated or not a notary
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "NOTARY") {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    }
  }, [status, session, router]);

  // Simulate API call to fetch customers
  useEffect(() => {
    if (status === "authenticated") {
      // This would be a real API call in a production app
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [status]);

  // Filter customers based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(query) || 
        customer.email.toLowerCase().includes(query) ||
        customer.phone.includes(query)
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery, customers]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const handleViewCustomerAppointments = (customerId) => {
    router.push(`/dashboard/notary/appointments?customer=${customerId}`);
  };

  const handleContactCustomer = (email) => {
    // This would open an email client or contact form in a real application
    window.open(`mailto:${email}`);
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
                <h1 className="text-xl font-semibold">Customers</h1>
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

          {/* Customers content */}
          <main className="flex-1 pb-8">
            <div className="mt-8 px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">Your Customers</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search customers..."
                    className="pl-10 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Customer List</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredCustomers.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 text-sm font-medium grid grid-cols-12 gap-4">
                        <div className="col-span-4">Customer</div>
                        <div className="col-span-3">Contact</div>
                        <div className="col-span-3">Last Appointment</div>
                        <div className="col-span-2 text-right">Actions</div>
                      </div>
                      <div className="divide-y">
                        {filteredCustomers.map((customer) => (
                          <div key={customer.id} className="px-4 py-3 grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-4 flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                <UserRound className="h-5 w-5" />
                              </div>
                              <div className="ml-3">
                                <div className="font-medium">{customer.name}</div>
                                <div className="text-sm text-gray-500">{customer.appointmentsCount} appointment{customer.appointmentsCount !== 1 ? 's' : ''}</div>
                              </div>
                            </div>
                            <div className="col-span-3">
                              <div className="flex items-center text-sm text-gray-600 mb-1">
                                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                {customer.email}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                {customer.phone}
                              </div>
                            </div>
                            <div className="col-span-3">
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                {formatDate(customer.lastAppointment)}
                              </div>
                            </div>
                            <div className="col-span-2 flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleContactCustomer(customer.email)}
                              >
                                Contact
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewCustomerAppointments(customer.id)}
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <UserRound className="h-6 w-6 text-gray-400" />
                      </div>
                      {searchQuery ? (
                        <>
                          <p className="text-lg font-medium">No matching customers</p>
                          <p className="text-gray-500 mt-1">Try adjusting your search terms</p>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-medium">No customers yet</p>
                          <p className="text-gray-500 mt-1">You'll see your customers here once you complete appointments</p>
                        </>
                      )}
                    </div>
                  )}
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