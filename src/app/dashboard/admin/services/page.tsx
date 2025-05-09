'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { BellIcon, SettingsIcon, Plus, Search, Edit, Trash2, DollarSign, Briefcase } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { toast } from 'sonner';

type Service = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  createdAt: string;
  _count?: {
    notaries: number;
    appointments: number;
  };
};

export default function AdminServices() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBasePrice, setFormBasePrice] = useState('');

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    }
  }, [status, session, router]);

  // Fetch services data
  useEffect(() => {
    async function fetchServices() {
      if (status === "authenticated" && session.user.role === "ADMIN") {
        try {
          setLoading(true);
          const response = await fetch('/api/services');
          
          if (!response.ok) {
            throw new Error('Failed to fetch services');
          }
          
          const data = await response.json();
          
          // Format date strings
          const formattedServices = data.map((service: any) => ({
            ...service,
            createdAt: new Date(service.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          }));
          
          setServices(formattedServices);
          setFilteredServices(formattedServices);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching services:', error);
          toast.error('Failed to load services');
          setLoading(false);
        }
      }
    }
    
    fetchServices();
  }, [status, session]);

  // Filter services based on search query
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = services.filter(
        service => 
          service.name.toLowerCase().includes(query) || 
          service.description.toLowerCase().includes(query)
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices(services);
    }
  }, [services, searchQuery]);

  const handleCreateService = async () => {
    try {
      // Validate form
      if (!formName || !formDescription || !formBasePrice) {
        toast.error('Please fill all required fields');
        return;
      }

      const price = parseFloat(formBasePrice);
      if (isNaN(price) || price <= 0) {
        toast.error('Please enter a valid price');
        return;
      }

      // Mock service creation - in a real app, you'd make an API call
      toast.success('Service created successfully');
      setIsCreateDialogOpen(false);
      
      // Reset form
      setFormName('');
      setFormDescription('');
      setFormBasePrice('');
      
      // Refresh services list
      // This would be updated with real API call in a production app
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service');
    }
  };

  const handleEditService = (service: Service) => {
    setCurrentService(service);
    setFormName(service.name);
    setFormDescription(service.description);
    setFormBasePrice(service.basePrice.toString());
    setIsEditDialogOpen(true);
  };

  const handleUpdateService = async () => {
    try {
      // Validate form
      if (!formName || !formDescription || !formBasePrice) {
        toast.error('Please fill all required fields');
        return;
      }

      const price = parseFloat(formBasePrice);
      if (isNaN(price) || price <= 0) {
        toast.error('Please enter a valid price');
        return;
      }

      // Mock service update - in a real app, you'd make an API call
      toast.success('Service updated successfully');
      setIsEditDialogOpen(false);
      
      // Reset form
      setFormName('');
      setFormDescription('');
      setFormBasePrice('');
      setCurrentService(null);
      
      // Refresh services list
      // This would be updated with real API call in a production app
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
    }
  };

  const handleDeleteService = (serviceId: string) => {
    // Implementation for deleting service
    // This should include a confirmation dialog
    toast.info(`Deleting service ${serviceId}`);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "authenticated" && session.user.role === "ADMIN") {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          userRole="admin"
          userName={session.user.name}
          userEmail={session.user.email}
        />

        <div className="md:pl-64 flex flex-col flex-1">
          {/* Top navbar */}
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
            <div className="flex flex-1 justify-between px-4 md:px-6">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">Manage Services</h1>
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

          {/* Main content */}
          <main className="flex-1 pb-8">
            <div className="mt-8 px-4 sm:px-6 lg:px-8">
              {/* Filter and search bar */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
                <div className="relative md:w-1/3">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search services..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="md:ml-auto">
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Service
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Service</DialogTitle>
                        <DialogDescription>
                          Add a new notary service that will be available to all notaries.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Service Name</Label>
                          <Input 
                            id="name" 
                            placeholder="e.g., Document Notarization" 
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea 
                            id="description" 
                            placeholder="Describe what this service includes..." 
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            rows={3}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="price">Base Price ($)</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                            <Input 
                              id="price" 
                              className="pl-9" 
                              placeholder="0.00" 
                              type="number"
                              min="0"
                              step="0.01"
                              value={formBasePrice}
                              onChange={(e) => setFormBasePrice(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateService}>Create Service</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Services grid */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <Card key={service.id}>
                      <CardHeader>
                        <CardTitle>{service.name}</CardTitle>
                        <CardDescription className="flex items-center justify-between">
                          <span>${service.basePrice.toFixed(2)}</span>
                          <span className="text-xs text-gray-500">Added: {service.createdAt}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                        <div className="flex justify-between text-sm text-gray-500 mb-4">
                          <div>Offered by: {service._count?.notaries || 0} notaries</div>
                          <div>Bookings: {service._count?.appointments || 0}</div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditService(service)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No services found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery 
                        ? 'Try adjusting your search to find what you're looking for.' 
                        : 'Get started by creating a new service.'}
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Service
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Edit Service Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
              <DialogDescription>
                Update the details for this notary service.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Service Name</Label>
                <Input 
                  id="edit-name" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Base Price ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input 
                    id="edit-price" 
                    className="pl-9" 
                    type="number"
                    min="0"
                    step="0.01"
                    value={formBasePrice}
                    onChange={(e) => setFormBasePrice(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateService}>Update Service</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return null;
}