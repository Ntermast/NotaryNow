'use client';

import { useState } from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { NotaryFilter } from '@/components/notary/notary-filter';
import { NotaryCard } from '@/components/notary/notary-card';
import { Search } from 'lucide-react';

// This would typically come from an API
const MOCK_NOTARIES = [
  {
    id: 1,
    name: 'John Smith',
    photo: '',
    rating: 4.9,
    reviewCount: 124,
    location: 'Manhattan, New York',
    distance: 1.2,
    hourlyRate: 75,
    services: ['Deed Notarization', 'Power of Attorney', 'Mortgage Signing'],
    availableToday: true,
    experience: 7
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    photo: '',
    rating: 4.8,
    reviewCount: 89,
    location: 'Brooklyn, New York',
    distance: 2.5,
    hourlyRate: 65,
    services: ['Deed Notarization', 'Affidavit', 'Will & Trust'],
    availableToday: false,
    experience: 5
  },
  {
    id: 3,
    name: 'Michael Brown',
    photo: '',
    rating: 4.7,
    reviewCount: 56,
    location: 'Queens, New York',
    distance: 3.8,
    hourlyRate: 60,
    services: ['Mortgage Signing', 'Deed Notarization', 'Certified Copies'],
    availableToday: true,
    experience: 3
  },
  {
    id: 4,
    name: 'Emily Davis',
    photo: '',
    rating: 5.0,
    reviewCount: 42,
    location: 'Bronx, New York',
    distance: 4.1,
    hourlyRate: 70,
    services: ['Power of Attorney', 'Will & Trust', 'Affidavit'],
    availableToday: false,
    experience: 6
  }
];

export default function NotarySearchPage() {
  const [notaries, setNotaries] = useState(MOCK_NOTARIES);
  const [sortOption, setSortOption] = useState('rating');
  const [filters, setFilters] = useState({});

  const handleFilterChange = (newFilters) => {
    console.log('Filters applied:', newFilters);
    // In a real app, you would fetch new results from API with these filters
    // For now, we'll just simulate filtering
    const filtered = MOCK_NOTARIES.filter(notary => {
      if (newFilters.service !== 'All Services' && !notary.services.includes(newFilters.service)) {
        return false;
      }
      if (notary.distance > newFilters.maxDistance) {
        return false;
      }
      if (notary.hourlyRate > newFilters.maxRate) {
        return false;
      }
      return true;
    });
    
    setNotaries(filtered);
    setFilters(newFilters);
  };

  const handleSortChange = (value) => {
    setSortOption(value);
    
    // Sort the notaries based on the selected option
    const sorted = [...notaries].sort((a, b) => {
      if (value === 'distance') return a.distance - b.distance;
      if (value === 'rating') return b.rating - a.rating;
      if (value === 'price') return a.hourlyRate - b.hourlyRate;
      if (value === 'experience') return b.experience - a.experience;
      return 0;
    });
    
    setNotaries(sorted);
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
              {notaries.length} Notaries Found
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
        </div>
      </div>
      <Footer />
    </div>
  );
}