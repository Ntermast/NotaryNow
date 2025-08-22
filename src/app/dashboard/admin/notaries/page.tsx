'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminNotariesPage() {
  const [notaries, setNotaries] = useState<any[]>([]);
  const [filteredNotaries, setFilteredNotaries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

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
      filtered = filtered.filter(notary => !notary.isApproved);
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(notary => notary.isApproved);
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
          notary.id === id ? { ...notary, isApproved: true } : notary
        )
      );

      toast.success('Notary approved successfully');
    } catch (error) {
      console.error('Error approving notary:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to approve notary');
    }
  };
  
  // View notary details - for future implementation
  const handleViewDetails = (notary: any) => {
    // For now, just show details in toast
    toast.info(`Viewing details for ${notary.name}`);
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
            {notaries.filter(n => !n.isApproved).length > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-white">
                {notaries.filter(n => !n.isApproved).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {filteredNotaries.length > 0 ? (
            filteredNotaries.map((notary) => (
              <Card key={notary.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>{notary.name}</CardTitle>
                    <Badge 
                      className={notary.isApproved ? 
                        "bg-green-100 text-green-800" : 
                        "bg-yellow-100 text-yellow-800"}
                    >
                      {notary.isApproved ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                  <CardDescription>
                    {notary.email} • {notary.location}
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
                      <span>${notary.hourlyRate?.toFixed(2) || 'N/A'}</span>
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
                      {!notary.isApproved && (
                        <Button 
                          size="sm"
                          onClick={() => handleApproveNotary(notary.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
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
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Pending
                    </Badge>
                  </div>
                  <CardDescription>
                    {notary.email} • {notary.location}
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
                        <span>{notary.address}, {notary.city}, {notary.state} {notary.zip}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Hourly Rate: </span>
                        <span>${notary.hourlyRate?.toFixed(2) || 'N/A'}</span>
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
                    <Badge className="bg-green-100 text-green-800">
                      Approved
                    </Badge>
                  </div>
                  <CardDescription>
                    {notary.email} • {notary.location}
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
                      <span>${notary.hourlyRate?.toFixed(2) || 'N/A'}</span>
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
      </Tabs>
    </div>
  );
}