'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { NotaryFilter } from '@/components/notary/notary-filter';
import { NotaryCard } from '@/components/notary/notary-card';
import { Search } from 'lucide-react';

export default function NotarySearchPage() {
  const [notaries, setNotaries] = useState<any[]>([]);
  const [sortOption, setSortOption] = useState('rating');
  const [filters, setFilters] = useState({
    zipCode: '',
    service: 'All Services',
    maxDistance: 5,
    maxRate: 100000 // Updated for RWF rates
  });
  const [loading, setLoading] = useState(true);

  const fetchNotaries = useCallback(async (customFilters = filters) => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (customFilters.zipCode) params.append('zipCode', customFilters.zipCode);
      if (customFilters.service !== 'All Services') params.append('service', customFilters.service);
      if (customFilters.maxDistance) params.append('maxDistance', customFilters.maxDistance.toString());
      if (customFilters.maxRate) params.append('maxRate', customFilters.maxRate.toString());

      const response = await fetch(`/api/notaries?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch notaries');

      const data = await response.json();

      // Sort the notaries based on the selected option
      const sorted = sortNotaries(data, sortOption);
      setNotaries(sorted);
    } catch (error) {
      console.error('Error fetching notaries:', error);
      // In case of error, set empty array
      setNotaries([]);
    } finally {
      setLoading(false);
    }
  }, [filters, sortOption]);

  // Fetch notaries on initial load
  useEffect(() => {
    fetchNotaries();
  }, [fetchNotaries]);

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchNotaries(updatedFilters);
  };

  const sortNotaries = (notariesList, option) => {
    return [...notariesList].sort((a, b) => {
      if (option === 'distance') return a.distance - b.distance;
      if (option === 'rating') return b.rating - a.rating;
      if (option === 'price') return a.hourlyRate - b.hourlyRate;
      if (option === 'experience') return b.experience - a.experience;
      return 0;
    });
  };

  const handleSortChange = (value) => {
    setSortOption(value);
    setNotaries(sortNotaries(notaries, value));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Find a Notary</h1>

        <NotaryFilter onFilterChange={handleFilterChange} />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">
              {loading ? 'Searching...' : `${notaries.length} Notaries Found`}
            </h2>
            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger className="w-auto">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="price">Price (Low to High)</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {notaries.map(notary => (
                <NotaryCard key={notary.id} notary={notary} />
              ))}

              {notaries.length === 0 && (
                <Card className="text-center p-8">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <CardTitle className="mb-2">No Notaries Found</CardTitle>
                  <CardDescription>
                    Try adjusting your filters or search in a different location.
                  </CardDescription>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}