'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, CheckCircle, XCircle, Edit, Trash2, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Define types for our data
interface Certification {
  id: string;
  name: string;
  description?: string;
  _count?: {
    notaries: number;
  };
}

interface PendingApproval {
  id: string;
  certificationName: string;
  notaryName: string;
  dateObtained: string;
}

export default function AdminCertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentCertification, setCurrentCertification] = useState<Certification | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        // Load certifications
        const response = await fetch('/api/admin/certifications');
        if (response.ok) {
          const data = await response.json();
          setCertifications(data);
        }
        
        // Load pending approvals
        const pendingResponse = await fetch('/api/admin/certifications/pending');
        if (pendingResponse.ok) {
          const pendingData = await pendingResponse.json();
          setPendingApprovals(pendingData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching certifications:', error);
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Add new certification handler
  const handleAddCertification = async () => {
    try {
      // Form validation
      if (!formName) {
        toast.error('Certification name is required');
        return;
      }

      // Create certification via API
      const response = await fetch('/api/admin/certifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formName,
          description: formDescription
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create certification');
      }

      // Get created certification
      const newCertification = await response.json();

      // Update local state
      setCertifications([...certifications, newCertification]);

      // Reset form and close dialog
      setFormName('');
      setFormDescription('');
      setIsAddDialogOpen(false);

      toast.success('Certification created successfully');
    } catch (error: any) {
      console.error('Error creating certification:', error);
      toast.error(error.message || 'Failed to create certification');
    }
  };

  // Edit certification handler
  const handleEditCertification = (certification: Certification) => {
    setCurrentCertification(certification);
    setFormName(certification.name);
    setFormDescription(certification.description || '');
    setIsEditDialogOpen(true);
  };

  // Update certification handler
  const handleUpdateCertification = async () => {
    try {
      if (!formName || !currentCertification) {
        toast.error('Certification name is required');
        return;
      }

      // Update certification via API - this endpoint needs to be created
      const response = await fetch(`/api/admin/certifications/${currentCertification.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formName,
          description: formDescription
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update certification');
      }

      // Get updated certification
      const updatedCertification = await response.json();

      // Update local state
      setCertifications(certifications.map(cert =>
        cert.id === currentCertification.id ? updatedCertification : cert
      ));

      // Reset form and close dialog
      setFormName('');
      setFormDescription('');
      setCurrentCertification(null);
      setIsEditDialogOpen(false);

      toast.success('Certification updated successfully');
    } catch (error: any) {
      console.error('Error updating certification:', error);
      toast.error(error.message || 'Failed to update certification');
    }
  };

  // Delete certification handler
  const handleDeleteCertification = async (certification: Certification) => {
    if (!confirm(`Are you sure you want to delete ${certification.name}?`)) {
      return;
    }

    try {
      // Delete certification via API - this endpoint needs to be created
      const response = await fetch(`/api/admin/certifications/${certification.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete certification');
      }

      // Remove from local state
      setCertifications(certifications.filter(c => c.id !== certification.id));
      toast.success('Certification deleted successfully');
    } catch (error: any) {
      console.error('Error deleting certification:', error);
      toast.error(error.message || 'Failed to delete certification');
    }
  };

  // Approve certification handler
  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/certifications/approve/${id}`, {
        method: 'PATCH'
      });

      if (response.ok) {
        // Remove from pending list
        setPendingApprovals(prev => prev.filter(item => item.id !== id));
        toast.success('Certification approved successfully');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve certification');
      }
    } catch (error: any) {
      console.error('Error approving certification:', error);
      toast.error(error.message || 'Failed to approve certification');
    }
  };

  // Reject certification handler
  const handleReject = async (id: string) => {
    try {
      // In a real app you'd call a reject API endpoint
      // For now, we'll just remove it from the UI
      setPendingApprovals(prev => prev.filter(item => item.id !== id));
      toast.success('Certification rejected');
    } catch (error) {
      console.error('Error rejecting certification:', error);
      toast.error('Failed to reject certification');
    }
  };

  if (loading) {
    return <div>Loading certifications...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Certifications Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Certification
        </Button>
      </div>

      {/* Pending Approvals Section */}
      {pendingApprovals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">
            Pending Approvals
            <Badge className="ml-2 bg-yellow-500">{pendingApprovals.length}</Badge>
          </h2>

          <div className="space-y-4">
            {pendingApprovals.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{item.certificationName}</h3>
                    <p className="text-sm text-gray-500">Submitted by: {item.notaryName}</p>
                    <p className="text-sm text-gray-500">Date: {new Date(item.dateObtained).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(item.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(item.id)}
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

      {/* All Certifications Section */}
      <h2 className="text-lg font-medium mb-4">All Certifications</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {certifications.map((cert) => (
          <div
            key={cert.id}
            className="bg-white p-4 rounded-lg shadow"
          >
            <h3 className="font-semibold">{cert.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{cert.description || 'No description available'}</p>
            <div className="mt-2 text-sm">Notaries: {cert._count?.notaries || 0}</div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEditCertification(cert)}
              >
                <Edit className="h-3 w-3 mr-1" /> Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteCertification(cert)}
              >
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}

        {certifications.length === 0 && (
          <div className="col-span-full text-center py-10">
            <Award className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-500 mt-2">No certifications found. Create your first certification to get started.</p>
          </div>
        )}
      </div>

      {/* Add Certification Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Certification</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Certification Name</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., National Notary Association Certification"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe the certification..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCertification}>Create Certification</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Certification Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Certification</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Certification Name</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateCertification}>Update Certification</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}