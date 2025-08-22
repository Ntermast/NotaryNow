// src/app/dashboard/secretary/notaries/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Filter, Star, MapPin, Phone, Mail, Calendar } from "lucide-react";
import { toast } from "sonner";

interface NotaryProfile {
  id: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  hourlyRate?: number;
  bio?: string;
  isApproved: boolean;
  averageRating?: number;
  totalReviews?: number;
  totalAppointments?: number;
  notaryServices?: Array<{
    service: { name: string };
    customPrice: number;
  }>;
}

export default function SecretaryNotaries() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notaries, setNotaries] = useState<NotaryProfile[]>([]);
  const [filteredNotaries, setFilteredNotaries] = useState<NotaryProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [locationFilter, setLocationFilter] = useState("ALL");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "SECRETARY") {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    }
  }, [status, session, router]);

  useEffect(() => {
    async function fetchNotaries() {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/notaries");
          if (response.ok) {
            const data = await response.json();
            setNotaries(data);
            setFilteredNotaries(data);
          }
        } catch (error) {
          console.error("Error fetching notaries:", error);
          toast.error("Failed to load notaries");
        } finally {
          setLoading(false);
        }
      }
    }

    fetchNotaries();
  }, [status]);

  useEffect(() => {
    let filtered = notaries;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((notary) =>
        notary.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notary.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notary.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notary.state?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((notary) => {
        if (statusFilter === "APPROVED") return notary.isApproved;
        if (statusFilter === "PENDING") return !notary.isApproved;
        return true;
      });
    }

    // Apply location filter
    if (locationFilter !== "ALL") {
      filtered = filtered.filter((notary) => notary.state === locationFilter);
    }

    setFilteredNotaries(filtered);
  }, [notaries, searchQuery, statusFilter, locationFilter]);

  const getUniqueStates = () => {
    return Array.from(new Set(notaries.map(n => n.state).filter(Boolean)));
  };

  const getRatingDisplay = (rating?: number, totalReviews?: number) => {
    if (!rating || !totalReviews) {
      return <span className="text-muted-foreground">No ratings yet</span>;
    }
    
    return (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{rating.toFixed(1)}</span>
        <span className="text-muted-foreground">({totalReviews} reviews)</span>
      </div>
    );
  };

  const viewNotarySchedule = (notaryId: string) => {
    // This would navigate to a detailed schedule view
    router.push(`/dashboard/secretary/notaries/${notaryId}/schedule`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "authenticated" && session.user.role === "SECRETARY") {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          userRole="secretary"
          userName={session.user.name}
          userEmail={session.user.email}
        />

        <div className="md:pl-64 flex flex-col flex-1">
          {/* Header */}
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
            <div className="flex flex-1 justify-between px-4 md:px-6">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">Notary Management</h1>
              </div>
            </div>
          </div>

          <main className="flex-1 p-6">
            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search notaries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="PENDING">Pending Approval</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Locations</SelectItem>
                        {getUniqueStates().filter(state => state).map((state) => (
                          <SelectItem key={state} value={state!}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("ALL");
                        setLocationFilter("ALL");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notaries List */}
            <Card>
              <CardHeader>
                <CardTitle>Notaries ({filteredNotaries.length})</CardTitle>
                <CardDescription>Manage notary profiles and schedules</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredNotaries.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredNotaries.map((notary) => (
                      <div key={notary.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{notary.user.name}</h3>
                              <Badge variant={notary.isApproved ? "default" : "secondary"}>
                                {notary.isApproved ? "Approved" : "Pending"}
                              </Badge>
                            </div>
                            
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {notary.user.email}
                              </div>
                              
                              {notary.user.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {notary.user.phone}
                                </div>
                              )}
                              
                              {(notary.city || notary.state) && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {[notary.city, notary.state].filter(Boolean).join(", ")}
                                </div>
                              )}
                            </div>
                          </div>

                          {notary.hourlyRate && (
                            <div className="text-right">
                              <div className="text-2xl font-bold">${notary.hourlyRate}</div>
                              <div className="text-sm text-muted-foreground">per hour</div>
                            </div>
                          )}
                        </div>

                        {/* Rating and Stats */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            {getRatingDisplay(notary.averageRating, notary.totalReviews)}
                          </div>
                          
                          {notary.totalAppointments !== undefined && (
                            <div className="text-sm text-muted-foreground">
                              {notary.totalAppointments} appointments completed
                            </div>
                          )}
                        </div>

                        {/* Services */}
                        {notary.notaryServices && notary.notaryServices.length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm font-medium mb-1">Services:</div>
                            <div className="flex flex-wrap gap-1">
                              {notary.notaryServices.slice(0, 3).map((service, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {service.service.name}
                                </Badge>
                              ))}
                              {notary.notaryServices.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{notary.notaryServices.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Bio */}
                        {notary.bio && (
                          <div className="mb-3">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {notary.bio}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-3 border-t">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewNotarySchedule(notary.id)}
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            View Schedule
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/notaries/${notary.id}`)}
                          >
                            View Profile
                          </Button>

                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`mailto:${notary.user.email}`, '_blank')}
                          >
                            Contact
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery || statusFilter !== "ALL" || locationFilter !== "ALL"
                      ? "No notaries match your current filters"
                      : "No notaries found"
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return null;
}