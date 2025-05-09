'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserIcon, Search, Edit, Trash2, Eye, BellIcon, SettingsIcon } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { toast } from 'sonner';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  notaryProfile?: {
    isApproved: boolean;
  };
  _count: {
    appointments: number;
    notaryAppointments: number;
    reviews: number;
  };
};

export default function AdminUsers() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    }
  }, [status, session, router]);

  // Fetch users data
  useEffect(() => {
    async function fetchUsers() {
      if (status === "authenticated" && session.user.role === "ADMIN") {
        try {
          setLoading(true);
          const response = await fetch('/api/admin/users');
          
          if (!response.ok) {
            throw new Error('Failed to fetch users');
          }
          
          const data = await response.json();
          
          // Format date strings
          const formattedUsers = data.map((user: any) => ({
            ...user,
            createdAt: new Date(user.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          }));
          
          setUsers(formattedUsers);
          setFilteredUsers(formattedUsers);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching users:', error);
          toast.error('Failed to load users');
          setLoading(false);
        }
      }
    }
    
    fetchUsers();
  }, [status, session]);

  // Filter and search users
  useEffect(() => {
    let result = [...users];
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter.toUpperCase());
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(query) || 
        user.email.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(result);
  }, [users, roleFilter, searchQuery]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'NOTARY':
        return 'bg-blue-100 text-blue-800';
      case 'CUSTOMER':
        return 'bg-green-100 text-green-800';
      case 'SECRETARY':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (userId: string) => {
    // Implementation for viewing user details would go here
    toast.info(`Viewing details for user ${userId}`);
  };

  const handleEditUser = (userId: string) => {
    // Implementation for editing user would go here
    toast.info(`Editing user ${userId}`);
  };

  const handleDeleteUser = (userId: string) => {
    // Implementation for deleting user would go here
    // This should include a confirmation dialog
    toast.info(`Deleting user ${userId}`);
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
          pendingCount={users.filter(u => u.role === 'NOTARY' && !u.notaryProfile?.isApproved).length}
        />

        <div className="md:pl-64 flex flex-col flex-1">
          {/* Top navbar */}
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
            <div className="flex flex-1 justify-between px-4 md:px-6">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">Manage Users</h1>
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
                    placeholder="Search users..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="md:w-48">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="NOTARY">Notary</SelectItem>
                      <SelectItem value="CUSTOMER">Customer</SelectItem>
                      <SelectItem value="SECRETARY">Secretary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:ml-auto">
                  <Button>Add New User</Button>
                </div>
              </div>

              {/* User cards */}
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <Card key={user.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{user.name}</CardTitle>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <span className="text-gray-500 w-16">Email:</span>
                              <span className="font-medium">{user.email}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <span className="text-gray-500 w-16">Phone:</span>
                              <span>{user.phone || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <span className="text-gray-500 w-16">Joined:</span>
                              <span>{user.createdAt}</span>
                            </div>
                            {user.role === 'NOTARY' && (
                              <div className="flex items-center text-sm">
                                <span className="text-gray-500 w-16">Status:</span>
                                <Badge className={user.notaryProfile?.isApproved ? 
                                  "bg-green-100 text-green-800" : 
                                  "bg-yellow-100 text-yellow-800"}>
                                  {user.notaryProfile?.isApproved ? "Approved" : "Pending"}
                                </Badge>
                              </div>
                            )}
                            <div className="flex items-center text-sm">
                              <span className="text-gray-500 w-16">Activity:</span>
                              <span>
                                {user.role === 'CUSTOMER' ? 
                                  `${user._count.appointments} appointments` : 
                                  user.role === 'NOTARY' ? 
                                  `${user._count.notaryAppointments} bookings` : 
                                  'N/A'}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewDetails(user.id)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditUser(user.id)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No users found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search or filter to find what you're looking for.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return null;
}