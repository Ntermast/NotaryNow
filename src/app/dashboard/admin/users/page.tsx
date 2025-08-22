'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserIcon, Search, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
          setFilteredUsers(data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...users];
    
    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(query) || 
        user.email.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(filtered);
  }, [users, roleFilter, searchQuery]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'NOTARY': return 'bg-blue-100 text-blue-800';
      case 'CUSTOMER': return 'bg-green-100 text-green-800';
      case 'SECRETARY': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
      </div>
      
      {/* Filter controls */}
      <div className="flex flex-col gap-4 md:flex-row mb-6">
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
      </div>
      
      {/* Users list */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <div 
            key={user.id} 
            className="bg-white p-4 rounded-lg shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center">
                  <h3 className="font-semibold">{user.name}</h3>
                  <Badge className={`ml-2 ${getRoleBadgeColor(user.role)}`}>{user.role}</Badge>
                </div>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-sm text-gray-500">
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              {user.role === 'NOTARY' && (
                <div>
                  <Badge className={user.notaryProfile?.isApproved ? 
                    "bg-green-100 text-green-800" : 
                    "bg-yellow-100 text-yellow-800"
                  }>
                    {user.notaryProfile?.isApproved ? (
                      <><Check className="h-3 w-3 mr-1" /> Approved</>
                    ) : (
                      <><X className="h-3 w-3 mr-1" /> Pending Approval</>
                    )}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-10">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-500 mt-2">
              {searchQuery || roleFilter !== 'all' ? 
                'No users match your filters.' : 
                'No users found in the system.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}