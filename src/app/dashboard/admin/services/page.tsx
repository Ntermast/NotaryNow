'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Edit, Trash2, Plus, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface PendingServiceRequest {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceDescription: string;
  basePrice: number;
  customPrice: number | null;
  notaryId: string;
  notaryName: string;
  notaryEmail: string;
  status: string;
  createdAt: string;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<any>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBasePrice, setFormBasePrice] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch services
        const servicesResponse = await fetch('/api/services');
        if (servicesResponse.ok) {
          const data = await servicesResponse.json();
          setServices(data);
        }

        // Fetch pending service requests
        const pendingResponse = await fetch('/api/admin/services/pending');
        if (pendingResponse.ok) {
          const pendingData = await pendingResponse.json();
          setPendingRequests(pendingData);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handle service approval
  const handleApproveService = async (requestId: string) => {
    try {
      const response = await fetch(`/api/admin/notaries/services/${requestId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve service');
      }

      // Remove from pending list
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      toast.success('Service request approved');
    } catch (error) {
      console.error('Error approving service:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to approve service');
    }
  };

  // Handle service rejection
  const handleRejectService = async (requestId: string) => {
    const reason = window.prompt('Please provide a reason for rejection (optional):') || undefined;

    try {
      const response = await fetch(`/api/admin/notaries/services/${requestId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject service');
      }

      // Remove from pending list
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      toast.success('Service request rejected');
    } catch (error) {
      console.error('Error rejecting service:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reject service');
    }
  };

  if (loading) {
    return <div>Loading services...</div>;
  }

  // Add new service handler
  const handleAddService = async () => {
    try {
      // Form validation
      if (!formName || !formDescription || !formBasePrice) {
        toast.error('Please fill all required fields');
        return;
      }

      const price = parseFloat(formBasePrice);
      if (isNaN(price) || price <= 0) {
        toast.error('Please enter a valid price');
        return;
      }

      // Create service via API
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formName,
          description: formDescription,
          basePrice: price
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create service');
      }

      // Get created service
      const newService = await response.json();

      // Update local state
      setServices([...services, newService]);

      // Reset form and close dialog
      setFormName('');
      setFormDescription('');
      setFormBasePrice('');
      setIsAddDialogOpen(false);

      toast.success('Service created successfully');
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create service');
    }
  };

  // Edit service handler
  const handleEditService = (service: any) => {
    setCurrentService(service);
    setFormName(service.name);
    setFormDescription(service.description);
    setFormBasePrice(service.basePrice.toString());
    setIsEditDialogOpen(true);
  };

  // Update service handler
  const handleUpdateService = async () => {
    try {
      if (!formName || !formDescription || !formBasePrice || !currentService) {
        toast.error('Please fill all required fields');
        return;
      }

      const price = parseFloat(formBasePrice);
      if (isNaN(price) || price <= 0) {
        toast.error('Please enter a valid price');
        return;
      }

      // Update service via API
      const response = await fetch(`/api/services/${currentService.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formName,
          description: formDescription,
          basePrice: price
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update service');
      }

      // Get updated service
      const updatedService = await response.json();

      // Update local state
      setServices(services.map(svc =>
        svc.id === currentService.id ? updatedService : svc
      ));

      // Reset form and close dialog
      setFormName('');
      setFormDescription('');
      setFormBasePrice('');
      setCurrentService(null);
      setIsEditDialogOpen(false);

      toast.success('Service updated successfully');
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update service');
    }
  };

  // Delete service handler
  const handleDeleteService = async (service: any) => {
    if (!confirm(`Are you sure you want to delete ${service.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete service');
      }

      // Remove from local state
      setServices(services.filter(s => s.id !== service.id));
      toast.success('Service deleted successfully');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete service');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Services</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Pending Service Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-yellow-500" />
            Pending Service Requests
            <Badge className="ml-2 bg-yellow-500">{pendingRequests.length}</Badge>
          </h2>

          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{request.serviceName}</h3>
                      <Badge variant="secondary">Service Request</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{request.serviceDescription}</p>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-gray-500">Requested by: </span>
                        <span className="font-medium">{request.notaryName}</span>
                        <span className="text-gray-500"> ({request.notaryEmail})</span>
                      </p>
                      <p>
                        <span className="text-gray-500">Base Price: </span>
                        <span className="font-medium">{Number(request.basePrice).toLocaleString()} RWF</span>
                      </p>
                      {request.customPrice !== null && (
                        <p>
                          <span className="text-gray-500">Custom Price: </span>
                          <span className="font-medium">{Number(request.customPrice).toLocaleString()} RWF</span>
                        </p>
                      )}
                      <p>
                        <span className="text-gray-500">Requested: </span>
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 md:self-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRejectService(request.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApproveService(request.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Services Section */}
      <h2 className="text-lg font-medium mb-4">All Services</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white p-4 rounded-lg shadow"
          >
            <h2 className="font-semibold">{service.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{service.description}</p>
            <div className="mt-2 font-medium">${service.basePrice.toFixed(2)}</div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEditService(service)}
              >
                <Edit className="h-3 w-3 mr-1" /> Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteService(service)}
              >
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">No services found. Create your first service to get started.</p>
          </div>
        )}
      </div>

      {/* Add Service Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Document Notarization"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe the service..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Base Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="price"
                  className="pl-9"
                  value={formBasePrice}
                  onChange={(e) => setFormBasePrice(e.target.value)}
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddService}>Create Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
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
              <Label htmlFor="edit-price">Base Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="edit-price"
                  className="pl-9"
                  value={formBasePrice}
                  onChange={(e) => setFormBasePrice(e.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
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