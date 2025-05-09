'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Edit, Trash2, Plus, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBasePrice, setFormBasePrice] = useState('');

  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch('/api/services');
        if (response.ok) {
          const data = await response.json();
          setServices(data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching services:', error);
        setLoading(false);
      }
    }
    
    fetchServices();
  }, []);

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
      toast.error(error.message || 'Failed to create service');
    }
  };

  // Edit service handler
  const handleEditService = (service) => {
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
      toast.error(error.message || 'Failed to update service');
    }
  };

  // Delete service handler
  const handleDeleteService = async (service) => {
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
      toast.error(error.message || 'Failed to delete service');
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