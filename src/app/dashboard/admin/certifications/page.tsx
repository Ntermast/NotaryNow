'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BellIcon, SettingsIcon, Search, Plus, CheckCircle, XCircle, Award, ExternalLink, Eye, Edit, Trash2 } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { toast } from 'sonner';

type Certification = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    notaries: number;
  };
};

type NotaryCertification = {
  id: string;
  notaryId: string;
  notaryName: string;
  notaryEmail: string;
  certificationId: string;
  certificationName: string;
  dateObtained: string;
  documentUrl: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

export default function AdminCertifications() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [pending, setPending] = useState<NotaryCertification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCertifications, setFilteredCertifications] = useState<Certification[]>([]);
  const [filteredPending, setFilteredPending] = useState<NotaryCertification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    }
  }, [status, session, router]);

  // Fetch certifications and pending approvals
  useEffect(() => {
    async function fetchData() {
      if (status === "authenticated" && session.user.role === "ADMIN") {
        setLoading(true);
        try {
          // Fetch certifications data
          const certificationsResponse = await fetch('/api/admin/certifications');
          if (!certificationsResponse.ok) {
            throw new Error('Failed to fetch certifications');
          }
          const certificationsData = await certificationsResponse.json();

          // Fetch pending certification approvals
          const pendingResponse = await fetch('/api/admin/certifications/pending');
          if (!pendingResponse.ok) {
            throw new Error('Failed to fetch pending certifications');
          }
          const pendingData = await pendingResponse.json();

          // Format date strings for certifications
          const formattedCertifications = certificationsData.map((cert: any) => ({
            ...cert,
            createdAt: new Date(cert.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          }));

          // Format date strings for pending approvals
          const formattedPending = pendingData.map((item: any) => ({
            ...item,
            dateObtained: item.dateObtained ? new Date(item.dateObtained).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }) : 'Not specified',
            createdAt: new Date(item.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          }));

          setCertifications(formattedCertifications);
          setPending(formattedPending);
          setFilteredCertifications(formattedCertifications);
          setFilteredPending(formattedPending);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching certifications data:', error);

          // Fall back to mock data if API fails (for development)
          const mockCertifications = [
            {
              id: "cert1",
              name: "National Notary Association Certification",
              description: "Official certification from the National Notary Association",
              createdAt: "Sep 15, 2023",
              _count: { notaries: 24 }
            },
            {
              id: "cert2",
              name: "State Notary Commission",
              description: "Official state-issued notary commission",
              createdAt: "Aug 10, 2023",
              _count: { notaries: 42 }
            },
            {
              id: "cert3",
              name: "Electronic Notarization Certification",
              description: "Certification for performing remote online notarizations",
              createdAt: "Jul 22, 2023",
              _count: { notaries: 16 }
            }
          ];

          const mockPending = [
            {
              id: "nc1",
              notaryId: "notary1",
              notaryName: "John Doe",
              notaryEmail: "john.doe@example.com",
              certificationId: "cert1",
              certificationName: "National Notary Association Certification",
              dateObtained: "Oct 15, 2023",
              documentUrl: "https://example.com/doc1.pdf",
              status: "pending",
              createdAt: "Oct 16, 2023"
            }
          ] as NotaryCertification[];

          setCertifications(mockCertifications);
          setPending(mockPending);
          setFilteredCertifications(mockCertifications);
          setFilteredPending(mockPending);

          toast.error('Failed to load certifications from API');
          setLoading(false);
        }
      }
    }

    fetchData();
  }, [status, session]);

  // Filter certifications and pending approvals based on search
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      
      const filteredCerts = certifications.filter(
        cert => 
          cert.name.toLowerCase().includes(query) || 
          (cert.description && cert.description.toLowerCase().includes(query))
      );
      
      const filteredPendingCerts = pending.filter(
        item => 
          item.notaryName.toLowerCase().includes(query) || 
          item.certificationName.toLowerCase().includes(query) ||
          item.notaryEmail.toLowerCase().includes(query)
      );
      
      setFilteredCertifications(filteredCerts);
      setFilteredPending(filteredPendingCerts);
    } else {
      setFilteredCertifications(certifications);
      setFilteredPending(pending);
    }
  }, [certifications, pending, searchQuery]);

  const handleCreateCertification = async () => {
    try {
      // Validate form
      if (!formName) {
        toast.error('Certification name is required');
        return;
      }

      // Create new certification via API
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create certification');
      }

      // Get the created certification
      const newCertification = await response.json();

      // Add the new certification to the state
      const formattedCert = {
        ...newCertification,
        createdAt: new Date(newCertification.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        _count: { notaries: 0 }
      };

      setCertifications(prev => [formattedCert, ...prev]);
      setFilteredCertifications(prev => [formattedCert, ...prev]);

      toast.success('Certification created successfully');
      setIsCreateDialogOpen(false);

      // Reset form
      setFormName('');
      setFormDescription('');
    } catch (error) {
      console.error('Error creating certification:', error);
      toast.error(error.message || 'Failed to create certification');
    }
  };

  const handleApproveCertification = async (id: string) => {
    try {
      // Approve certification via API
      const response = await fetch(`/api/admin/certifications/approve/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve certification');
      }

      // Remove from pending list upon successful approval
      setPending(prev => prev.filter(item => item.id !== id));
      toast.success('Certification approved successfully');
    } catch (error) {
      console.error('Error approving certification:', error);
      toast.error(error.message || 'Failed to approve certification');
    }
  };

  const handleRejectCertification = async (id: string) => {
    try {
      // In a real app, create a rejection API endpoint
      // For now, we'll simulate deletion/rejection by removing from UI
      setPending(prev => prev.filter(item => item.id !== id));
      toast.success('Certification rejected');
    } catch (error) {
      console.error('Error rejecting certification:', error);
      toast.error('Failed to reject certification');
    }
  };

  const handleEditCertification = (certId: string) => {
    // Mock edit process - in a real app, you'd implement proper editing flow
    toast.info(`Editing certification ${certId}`);
  };

  const handleDeleteCertification = (certId: string) => {
    // Mock delete process - in a real app, you'd make an API call with confirmation
    toast.info(`Deleting certification ${certId}`);
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
          pendingCount={pending.length}
        />

        <div className="md:pl-64 flex flex-col flex-1">
          {/* Top navbar */}
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
            <div className="flex flex-1 justify-between px-4 md:px-6">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">Certifications Management</h1>
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
              {/* Search and add button */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
                <div className="relative md:w-1/3">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search certifications..."
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
                        Add New Certification
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Certification</DialogTitle>
                        <DialogDescription>
                          Add a new certification that notaries can apply for or upload.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Certification Name</Label>
                          <Input 
                            id="name" 
                            placeholder="e.g., Notary Public Commission" 
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea 
                            id="description" 
                            placeholder="Provide details about this certification..." 
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateCertification}>Create Certification</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Tabs defaultValue="certifications">
                <TabsList className="mb-6">
                  <TabsTrigger value="certifications">All Certifications</TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending Approvals
                    {pending.length > 0 && (
                      <Badge className="ml-2 bg-primary text-white">{pending.length}</Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="certifications">
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCertifications.length > 0 ? (
                      filteredCertifications.map((cert) => (
                        <Card key={cert.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{cert.name}</CardTitle>
                              <Badge className="bg-blue-100 text-blue-800">
                                {cert._count?.notaries || 0} notaries
                              </Badge>
                            </div>
                            <CardDescription>
                              Added on {cert.createdAt}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 mb-6">
                              {cert.description || 'No description available.'}
                            </p>
                          </CardContent>
                          <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditCertification(cert.id)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteCertification(cert.id)}>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </CardFooter>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-10">
                        <Award className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No certifications found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchQuery 
                            ? 'Try adjusting your search to find what you're looking for.' 
                            : 'Get started by creating a new certification type.'}
                        </p>
                        <div className="mt-6">
                          <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Certification
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="pending">
                  <div className="space-y-4">
                    {filteredPending.length > 0 ? (
                      filteredPending.map((item) => (
                        <Card key={item.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{item.certificationName}</CardTitle>
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Pending Review
                              </Badge>
                            </div>
                            <CardDescription>
                              Submitted on {item.createdAt}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <h3 className="text-sm font-medium mb-2">Notary Information</h3>
                                <p className="text-sm">{item.notaryName}</p>
                                <p className="text-sm text-gray-500">{item.notaryEmail}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium mb-2">Certification Details</h3>
                                <p className="text-sm">Date obtained: {item.dateObtained}</p>
                                {item.documentUrl && (
                                  <Button variant="link" className="p-0 h-auto" asChild>
                                    <a href={item.documentUrl} target="_blank" rel="noopener noreferrer">
                                      View Document <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={`/dashboard/admin/notaries/${item.notaryId}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View Notary
                              </a>
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleRejectCertification(item.id)}>
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button size="sm" onClick={() => handleApproveCertification(item.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </CardFooter>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="py-10 text-center">
                          <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-semibold text-gray-900">No pending approvals</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            All certification submissions have been reviewed.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return null;
}