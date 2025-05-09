'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Calendar, Mail, Phone, UserIcon } from 'lucide-react';
import { toast } from 'sonner';

// Define Customer type
interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
  joinDate: string;
  _count?: {
    appointments?: number;
    reviews?: number;
  }
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch customers data
  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/users?role=CUSTOMER');
        
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        
        const data = await response.json();
        
        // Format date strings
        const formattedCustomers = data.map((customer: any) => ({
          ...customer,
          joinDate: new Date(customer.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        }));
        
        setCustomers(formattedCustomers);
        setFilteredCustomers(formattedCustomers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast.error('Failed to load customers');
        setLoading(false);
      }
    }
    
    fetchCustomers();
  }, []);

  // Apply search filter
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = customers.filter(customer => 
        customer.name?.toLowerCase().includes(query) || 
        customer.email?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [customers, searchQuery]);

  // View customer details handler
  const handleViewDetails = (customer: Customer) => {
    // For now, just show some customer info in a toast
    toast.info(`Viewing details for ${customer.name}`);
  };
  
  // View customer appointments handler
  const handleViewAppointments = (customer: Customer) => {
    // For now, just show some customer info in a toast
    toast.info(`Viewing appointments for ${customer.name}`);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading customers...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Customers</h1>
      </div>
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative w-full md:w-1/3 mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search customers..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Customer list */}
      <div className="space-y-4">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <Card key={customer.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{customer.name || 'Unnamed Customer'}</CardTitle>
                  <Badge className="bg-green-100 text-green-800">
                    Customer
                  </Badge>
                </div>
                <CardDescription>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-gray-500" />
                      {customer.email}
                    </div>
                    {customer.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1 text-gray-500" />
                        {customer.phone}
                      </div>
                    )}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-500">Joined: </span>
                      <span>{customer.joinDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Appointments: </span>
                      <span>{customer._count?.appointments || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Reviews: </span>
                      <span>{customer._count?.reviews || 0}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 md:self-end">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewAppointments(customer)}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Appointments
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewDetails(customer)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-10">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-500 mt-2">
              {searchQuery ? 'No customers match your search' : 'No customers found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}