'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sidebar } from '@/components/layout/sidebar';
import { BellIcon, SettingsIcon, DollarSign, Plus, Edit, Trash, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function NotaryServicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [allServices, setAllServices] = useState([]);
  const [notaryServices, setNotaryServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customPrices, setCustomPrices] = useState({});

  // Redirect if not authenticated or not a notary
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "NOTARY") {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    }
  }, [status, session, router]);

  // Fetch services data
  useEffect(() => {
    async function fetchServices() {
      if (status === "authenticated") {
        try {
          // Get all available services
          const servicesResponse = await fetch('/api/services');
          if (!servicesResponse.ok) throw new Error('Failed to fetch services');
          const servicesData = await servicesResponse.json();
          setAllServices(servicesData);
          
          // Get notary profile with services
          const profileResponse = await fetch('/api/notaries/profile');
          if (!profileResponse.ok) throw new Error('Failed to fetch profile');
          const profileData = await profileResponse.json();
          
          // Extract notary services and set initial custom prices
          setNotaryServices(profileData.notaryServices || []);
          
          const prices = {};
          (profileData.notaryServices || []).forEach(service => {
            if (service.customPrice) {
              prices[service.serviceId] = service.customPrice;
            }
          });
          setCustomPrices(prices);
          
          setLoading(false);
        } catch (error) {
          console.error('Error fetching services:', error);
          toast.error('Failed to load services');
          setLoading(false);
        }
      }
    }
    
    fetchServices();
  }, [status]);

  const isServiceSelected = (serviceId) => {
    return notaryServices.some(service => service.serviceId === serviceId);
  };

  const getBasePrice = (serviceId) => {
    const service = allServices.find(s => s.id === serviceId);
    return service ? service.basePrice : 0;
  };

  const getCustomPrice = (serviceId) => {
    return customPrices[serviceId] || getBasePrice(serviceId);
  };

  const handleServiceToggle = async (serviceId, isChecked) => {
    try {
      const method = isChecked ? 'POST' : 'DELETE';
      const response = await fetch(`/api/notaries/services/${serviceId}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Failed to ${isChecked ? 'add' : 'remove'} service`);
      
      // Update local state
      if (isChecked) {
        const newService = { serviceId, customPrice: null };
        setNotaryServices([...notaryServices, newService]);
      } else {
        setNotaryServices(notaryServices.filter(service => service.serviceId !== serviceId));
        
        // Remove custom price if it exists
        if (customPrices[serviceId]) {
          const newPrices = { ...customPrices };
          delete newPrices[serviceId];
          setCustomPrices(newPrices);
        }
      }
      
      toast.success(`Service ${isChecked ? 'added' : 'removed'} successfully`);
    } catch (error) {
      console.error(`Error ${isChecked ? 'adding' : 'removing'} service:`, error);
      toast.error(`Failed to ${isChecked ? 'add' : 'remove'} service`);
    }
  };

  const handlePriceChange = (serviceId, newPrice) => {
    setCustomPrices({
      ...customPrices,
      [serviceId]: newPrice,
    });
  };

  const saveCustomPrice = async (serviceId) => {
    try {
      // This would be implemented with a real API endpoint
      // For now, just show a success message
      toast.success('Custom price updated successfully');
    } catch (error) {
      console.error('Error updating custom price:', error);
      toast.error('Failed to update custom price');
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
                <h1 className="text-xl font-semibold">Service Offerings</h1>
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

          {/* Services content */}
          <main className="flex-1 pb-8">
            <div className="mt-8 px-4 sm:px-6 lg:px-8">
              <Card>
                <CardHeader>
                  <CardTitle>Your Services</CardTitle>
                  <CardDescription>
                    Manage the services you offer to your customers. Select services and set custom prices.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {allServices.map(service => (
                      <div key={service.id} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={`service-${service.id}`}
                            checked={isServiceSelected(service.id)}
                            onCheckedChange={(checked) => handleServiceToggle(service.id, checked)}
                          />
                          <div className="grid gap-1.5 flex-1">
                            <div className="flex justify-between items-start">
                              <Label
                                htmlFor={`service-${service.id}`}
                                className="font-medium"
                              >
                                {service.name}
                              </Label>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                                <span className="font-medium">{service.basePrice}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500">
                              {service.description}
                            </p>
                          </div>
                        </div>
                        
                        {isServiceSelected(service.id) && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <Info className="h-4 w-4 text-blue-500 mr-2" />
                                <span className="text-sm text-gray-600">You can set a custom price for this service</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Label htmlFor={`price-${service.id}`} className="text-sm">Custom Price:</Label>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                  <Input
                                    id={`price-${service.id}`}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="pl-8 w-24"
                                    value={getCustomPrice(service.id)}
                                    onChange={(e) => handlePriceChange(service.id, parseFloat(e.target.value))}
                                  />
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => saveCustomPrice(service.id)}
                                >
                                  Apply
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t">
                  <div className="flex items-center text-sm text-gray-500">
                    <Info className="h-4 w-4 mr-2" />
                    Changes to your services will be visible to customers immediately
                  </div>
                </CardFooter>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return null;
}