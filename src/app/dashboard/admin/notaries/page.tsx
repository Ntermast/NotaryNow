'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, CheckCircle, XCircle, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminNotariesPage() {
  const [notaries, setNotaries] = useState<any[]>([]);
  const [filteredNotaries, setFilteredNotaries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedNotary, setSelectedNotary] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [notaryToReject, setNotaryToReject] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingRejection, setIsSubmittingRejection] = useState(false);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Declined</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
    }
  };

  const formatNotaryType = (type?: string) => {
    if (type === 'PUBLIC') return 'Public Notary';
    if (type === 'PRIVATE') return 'Private Notary';
    return 'Notary';
  };

  // Fetch notaries data
  useEffect(() => {
    async function fetchNotaries() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/notaries');
        
        if (!response.ok) {
          throw new Error('Failed to fetch notaries');
        }
        
        const data = await response.json();
        
        // Format date strings
        const formattedNotaries = data.map((notary: any) => ({
          ...notary,
          joinDate: new Date(notary.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        }));
        
        setNotaries(formattedNotaries);
        setFilteredNotaries(formattedNotaries);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notaries:', error);
        toast.error('Failed to load notaries');
        setLoading(false);
      }
    }
    
    fetchNotaries();
  }, []);

  // Apply search filter and tab filter
  useEffect(() => {
    let filtered = [...notaries];
    
    // Apply tab filter
    if (activeTab === 'pending') {
      filtered = filtered.filter(notary => notary.approvalStatus === 'PENDING');
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(notary => notary.approvalStatus === 'APPROVED');
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(notary => notary.approvalStatus === 'REJECTED');
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notary => 
        notary.name.toLowerCase().includes(query) || 
        notary.email.toLowerCase().includes(query) ||
        (notary.location && notary.location.toLowerCase().includes(query))
      );
    }
    
    setFilteredNotaries(filtered);
  }, [notaries, searchQuery, activeTab]);

  // Approve notary handler
  const handleApproveNotary = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/notaries/approve/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve notary');
      }

      // Update local state
      setNotaries(prev =>
        prev.map((notary: any) =>
          notary.id === id
            ? { ...notary, isApproved: true, approvalStatus: 'APPROVED', rejectionReason: null }
            : notary
        )
      );

      toast.success('Notary approved successfully');
    } catch (error) {
      console.error('Error approving notary:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to approve notary');
    }
  };
  
  const openRejectDialog = (notary: any) => {
    setNotaryToReject(notary);
    setRejectionReason('');
    setIsRejectDialogOpen(true);
  };

  const handleRejectNotary = async () => {
    if (!notaryToReject) return;

    setIsSubmittingRejection(true);
    try {
      const response = await fetch(`/api/admin/notaries/reject/${notaryToReject.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: rejectionReason.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to reject notary');
      }

      setNotaries((prev) =>
        prev.map((notary: any) =>
          notary.id === notaryToReject.id
            ? {
                ...notary,
                isApproved: false,
                approvalStatus: 'REJECTED',
                rejectionReason: rejectionReason.trim() || null,
              }
            : notary
        )
      );

      if (selectedNotary && selectedNotary.id === notaryToReject.id) {
        setSelectedNotary({
          ...selectedNotary,
          isApproved: false,
          approvalStatus: 'REJECTED',
          rejectionReason: rejectionReason.trim() || null,
        });
      }

      toast.success('Notary application declined');
      setIsRejectDialogOpen(false);
      setNotaryToReject(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting notary:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reject notary');
    } finally {
      setIsSubmittingRejection(false);
    }
  };
  
  // View notary details
  const handleViewDetails = async (notary: any) => {
    try {
      // Fetch detailed notary information including certifications
      const response = await fetch(`/api/admin/notaries/${notary.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notary details');
      }
      
      const detailedNotary = await response.json();
      setSelectedNotary(detailedNotary);
      setIsDetailsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching notary details:', error);
      toast.error('Failed to load notary details');
    }
  };

  const applyServiceUpdateToState = (serviceId: string, updatedService: any) => {
    const normalized: Record<string, any> = {
      status: updatedService.status,
      rejectionReason: updatedService.rejectionReason ?? null,
      approvedAt: updatedService.approvedAt ?? null,
      customPrice: updatedService.customPrice ?? null,
    };
    if (updatedService.service?.name) {
      normalized.name = updatedService.service.name;
    }

    setNotaries((prev) =>
      prev.map((notary) => ({
        ...notary,
        services: notary.services.map((service: any) =>
          service.id === serviceId ? { ...service, ...normalized } : service
        ),
      }))
    );

    setSelectedNotary((prev) =>
      prev
        ? {
            ...prev,
            services: prev.services.map((service: any) =>
              service.id === serviceId ? { ...service, ...normalized } : service
            ),
          }
        : prev
    );
  };

  const handleServiceApproval = async (serviceId: string, action: 'approve' | 'reject') => {
    try {
      let reason: string | undefined;
      if (action === 'reject') {
        reason = window.prompt('Please share a short reason for the decline (optional).') || undefined;
      }

      const response = await fetch(`/api/admin/notaries/services/${serviceId}/${action}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: action === 'reject' ? JSON.stringify({ reason }) : undefined,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Failed to ${action} service`);
      }

      const data = await response.json();
      applyServiceUpdateToState(serviceId, data);

      toast.success(`Service ${action === 'approve' ? 'approved' : 'declined'} successfully`);
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update service');
    }
  };

  const handleCertificationDecision = async (
    certificationId: string,
    status: 'APPROVED' | 'REJECTED'
  ) => {
    try {
      const response = await fetch(`/api/admin/notaries/certifications/${certificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to update certification');
      }

      const updated = await response.json();

      setSelectedNotary((prev) =>
        prev
          ? {
              ...prev,
              certifications: prev.certifications.map((cert: any) =>
                cert.id === certificationId
                  ? { ...cert, isApproved: updated.status === 'APPROVED', status: updated.status }
                  : cert
              ),
            }
          : prev
      );

      toast.success(
        `Certification ${status === 'APPROVED' ? 'approved' : 'declined'} successfully`
      );
    } catch (error) {
      console.error('Error updating certification:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update certification');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading notaries...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Notaries</h1>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6">
        <div className="relative w-full md:w-1/3 mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search notaries..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Notaries list with tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Notaries</TabsTrigger>
          <TabsTrigger value="pending">
            Pending Approval
            {notaries.filter(n => n.approvalStatus === 'PENDING').length > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-white">
                {notaries.filter(n => n.approvalStatus === 'PENDING').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved
            {notaries.filter(n => n.approvalStatus === 'APPROVED').length > 0 && (
              <Badge className="ml-2 bg-green-500 text-white">
                {notaries.filter(n => n.approvalStatus === 'APPROVED').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Declined
            {notaries.filter(n => n.approvalStatus === 'REJECTED').length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">
                {notaries.filter(n => n.approvalStatus === 'REJECTED').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {filteredNotaries.length > 0 ? (
            filteredNotaries.map((notary) => (
              <Card key={notary.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>{notary.name}</CardTitle>
                    {renderStatusBadge(notary.approvalStatus)}
                  </div>
                  <CardDescription>
                    {notary.email} • {notary.location} • {formatNotaryType(notary.notaryType)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 justify-between text-sm">
                    <div>
                      <span className="text-gray-500">Joined: </span>
                      <span>{notary.joinDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Services: </span>
                      <span>{notary.services.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Hourly Rate: </span>
                      <span>{notary.hourlyRate ? `${Number(notary.hourlyRate).toLocaleString()} RWF` : 'N/A'}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewDetails(notary)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {notary.approvalStatus === 'PENDING' && (
                        <Button 
                          size="sm"
                          onClick={() => handleApproveNotary(notary.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      )}
                      {notary.approvalStatus === 'PENDING' && (
                        <Button 
                          size="sm"
                          variant="destructive"
                          onClick={() => openRejectDialog(notary)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      )}
                    </div>
                  </div>
                  {notary.approvalStatus === 'REJECTED' && notary.rejectionReason && (
                    <div className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-md p-3">
                      <span className="font-medium">Rejection reason:</span> {notary.rejectionReason}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No notaries found</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          {filteredNotaries.length > 0 ? (
            filteredNotaries.map((notary) => (
              <Card key={notary.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>{notary.name}</CardTitle>
                    {renderStatusBadge(notary.approvalStatus)}
                  </div>
                  <CardDescription>
                    {notary.email} • {notary.location} • {formatNotaryType(notary.notaryType)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:justify-between gap-4">
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-500">Joined: </span>
                        <span>{notary.joinDate}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Address: </span>
                        <span>{notary.address}, {notary.location} {notary.zip}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Hourly Rate: </span>
                        <span>{notary.hourlyRate ? `${Number(notary.hourlyRate).toLocaleString()} RWF` : 'N/A'}</span>
                      </div>
                      {notary.bio && (
                        <div>
                          <span className="text-gray-500">Bio: </span>
                          <span>{notary.bio}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 md:self-end">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewDetails(notary)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleApproveNotary(notary.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm"
                        variant="destructive"
                        onClick={() => openRejectDialog(notary)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No pending notary approval requests</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          {filteredNotaries.length > 0 ? (
            filteredNotaries.map((notary) => (
              <Card key={notary.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>{notary.name}</CardTitle>
                    {renderStatusBadge(notary.approvalStatus)}
                  </div>
                  <CardDescription>
                    {notary.email} • {notary.location} • {formatNotaryType(notary.notaryType)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-gray-500">Joined: </span>
                      <span>{notary.joinDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Services: </span>
                      <span>{notary.services.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Hourly Rate: </span>
                      <span>{notary.hourlyRate ? `${Number(notary.hourlyRate).toLocaleString()} RWF` : 'N/A'}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewDetails(notary)}
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
              <p className="text-gray-500">No approved notaries found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {filteredNotaries.length > 0 ? (
            filteredNotaries.map((notary) => (
              <Card key={notary.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>{notary.name}</CardTitle>
                    {renderStatusBadge(notary.approvalStatus)}
                  </div>
                  <CardDescription>
                    {notary.email} • {notary.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Joined: </span>
                      <span>{notary.joinDate}</span>
                    </div>
                    {notary.rejectionReason && (
                      <div className="p-3 rounded-md bg-red-50 border border-red-100 text-red-700 text-sm">
                        <span className="font-medium">Reason:</span> {notary.rejectionReason}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewDetails(notary)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleApproveNotary(notary.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No declined notaries</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Notary Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notary Details - {selectedNotary?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedNotary && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Name:</span>
                    <p>{selectedNotary.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <p>{selectedNotary.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Phone:</span>
                    <p>{selectedNotary.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Status:</span>
                    <div className="mt-1">
                      {renderStatusBadge(selectedNotary.approvalStatus)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Notary Type:</span>
                    <p>{formatNotaryType(selectedNotary.notaryType)}</p>
                  </div>
                </div>
                {selectedNotary.approvalStatus === 'REJECTED' && selectedNotary.rejectionReason && (
                  <div className="mt-3 rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                    <span className="font-medium">Rejection reason:</span> {selectedNotary.rejectionReason}
                  </div>
                )}
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Address</h3>
                <p>{selectedNotary.address}</p>
                <p>{selectedNotary.city}, {selectedNotary.state} {selectedNotary.zip}</p>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Professional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Hourly Rate:</span>
                    <p>{selectedNotary.hourlyRate ? `${Number(selectedNotary.hourlyRate).toLocaleString()} RWF` : 'Not set'}</p>
                  </div>
                </div>
                {selectedNotary.bio && (
                  <div className="mt-4">
                    <span className="text-sm text-gray-500">Bio:</span>
                    <p className="mt-1">{selectedNotary.bio}</p>
                  </div>
                )}
              </div>

              {/* Services */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Services Offered</h3>
                <div className="space-y-3">
                  {selectedNotary.services?.map((service: any) => (
                    <div key={service.id} className="border rounded-lg p-3">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <div className="flex flex-wrap gap-2 mt-1 text-sm">
                            <Badge
                              className={
                                service.status === 'APPROVED'
                                  ? 'bg-green-100 text-green-800'
                                  : service.status === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }
                            >
                              {service.status === 'APPROVED'
                                ? 'Approved'
                                : service.status === 'PENDING'
                                  ? 'Pending Review'
                                  : 'Declined'}
                            </Badge>
                            {service.customPrice && (
                              <Badge variant="secondary">
                                Custom Price: {Number(service.customPrice).toLocaleString()} RWF
                              </Badge>
                            )}
                          </div>
                          {service.rejectionReason && (
                            <p className="text-xs text-red-600 mt-1">
                              Reason: {service.rejectionReason}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {service.status !== 'APPROVED' && (
                            <Button
                              size="sm"
                              onClick={() => handleServiceApproval(service.id, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          )}
                          {service.status !== 'REJECTED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleServiceApproval(service.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!selectedNotary.services || selectedNotary.services.length === 0) && (
                    <p className="text-sm text-gray-500">No services requested yet.</p>
                  )}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Certifications</h3>
                {selectedNotary.certifications && selectedNotary.certifications.length > 0 ? (
                  <div className="space-y-3">
                    {selectedNotary.certifications.map((cert: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{cert.name}</h4>
                            <p className="text-sm text-gray-500">
                              Issued: {cert.dateObtained ? new Date(cert.dateObtained).toLocaleDateString() : 'Not specified'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                cert.status === 'APPROVED'
                                  ? "bg-green-100 text-green-800"
                                  : cert.status === 'REJECTED'
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {cert.status === 'APPROVED'
                                ? "Approved"
                                : cert.status === 'REJECTED'
                                  ? "Declined"
                                  : "Pending"}
                            </Badge>
                            {cert.documentUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={cert.documentUrl} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-4 w-4 mr-1" />
                                  View Document
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                        {cert.status !== 'APPROVED' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleCertificationDecision(cert.submissionId || cert.id, 'APPROVED')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCertificationDecision(cert.submissionId || cert.id, 'REJECTED')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No certifications uploaded</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                {selectedNotary.approvalStatus !== 'APPROVED' && (
                  <Button
                    className="flex-1"
                    onClick={async () => {
                      await handleApproveNotary(selectedNotary.id);
                      setIsDetailsDialogOpen(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve Notary
                  </Button>
                )}
                {selectedNotary.approvalStatus === 'PENDING' && (
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => {
                      openRejectDialog(selectedNotary);
                      setIsDetailsDialogOpen(false);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDetailsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRejectDialogOpen}
        onOpenChange={(open) => {
          setIsRejectDialogOpen(open);
          if (!open) {
            setNotaryToReject(null);
            setRejectionReason('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Decline Notary Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Provide a short explanation for declining{' '}
              <span className="font-semibold">{notaryToReject?.name}</span>.
              The notary will see this message.
            </p>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for declining (optional but recommended)"
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejectDialogOpen(false);
                  setNotaryToReject(null);
                  setRejectionReason('');
                }}
                disabled={isSubmittingRejection}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectNotary}
                disabled={isSubmittingRejection}
              >
                {isSubmittingRejection ? 'Declining...' : 'Decline Notary'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
