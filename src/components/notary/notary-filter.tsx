import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Search, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

export function NotaryFilter({ onFilterChange }) {
  const [zipCode, setZipCode] = useState('');
  const [selectedService, setSelectedService] = useState('All Services');
  const [maxDistance, setMaxDistance] = useState([5]);
  const [maxRate, setMaxRate] = useState([100000]); // Updated for RWF
  const [showFilters, setShowFilters] = useState(false);

  const services = [
    "All Services",
    "Deed Notarization",
    "Power of Attorney",
    "Mortgage Signing",
    "Affidavit",
    "Will & Trust",
    "Certified Copies"
  ];

  const handleSearch = () => {
    onFilterChange({
      zipCode,
      service: selectedService,
      maxDistance: maxDistance[0],
      maxRate: maxRate[0]
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="zip">Sector or District</Label>
          <div className="mt-1 relative">
            <Input 
              id="zip" 
              placeholder="Enter Sector or District"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="service">Service Needed</Label>
          <Select 
            value={selectedService} 
            onValueChange={setSelectedService}
          >
            <SelectTrigger id="service">
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service} value={service}>
                  {service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end">
          <Button className="w-full" onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Search Notaries
          </Button>
        </div>
      </div>
      
      <div className="mt-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm flex items-center"
        >
          <Filter className="mr-1 h-3 w-3" />
          Filters
          {showFilters ? 
            <ChevronUp className="ml-1 h-3 w-3" /> : 
            <ChevronDown className="ml-1 h-3 w-3" />
          }
        </Button>
        
        {showFilters && (
          <div className="grid gap-6 md:grid-cols-2 mt-4 pt-4 border-t">
            <div>
              <div className="flex justify-between mb-2">
                <Label>Maximum Distance</Label>
                <span className="text-sm">{maxDistance[0]} km</span>
              </div>
              <Slider 
                value={maxDistance} 
                onValueChange={setMaxDistance} 
                max={30}
                step={1}
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <Label>Maximum Hourly Rate</Label>
                <span className="text-sm">{maxRate[0].toLocaleString()} RWF</span>
              </div>
              <Slider 
                value={maxRate} 
                onValueChange={setMaxRate} 
                max={150000}
                step={5000}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}