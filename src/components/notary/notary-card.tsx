import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookingForm } from './booking-form';
// import { BookingForm } from '@/components/notary/booking-form';

export function NotaryCard({ notary }) {
  const [selectedNotary, setSelectedNotary] = useState(null);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const handleBooking = () => {
    setSelectedNotary(notary);
  };

  return (
    <Card className="overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/4 p-6 flex flex-col items-center justify-center bg-gray-50">
          <Avatar className="h-20 w-20 mb-3">
            <AvatarImage src={notary.photo || ''} />
            <AvatarFallback className="text-lg">{getInitials(notary.name)}</AvatarFallback>
          </Avatar>
          <h3 className="font-medium text-center">{notary.name}</h3>
          <div className="flex items-center mt-1">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
            <span>{notary.rating.toFixed(1)}</span>
            <span className="text-gray-500 text-sm ml-1">({notary.reviewCount})</span>
          </div>
          {notary.availableToday && (
            <Badge className="mt-2 bg-green-100 text-green-800 hover:bg-green-100">
              Available Today
            </Badge>
          )}
        </div>
        
        <CardContent className="md:w-2/4 border-l border-r p-6">
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">Location</div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                <span>{notary.location}</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {notary.distance} miles away
                </Badge>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">Services</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {notary.services.map(service => (
                  <Badge key={service} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">Experience</div>
              <div>{notary.experience} years</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">Rate</div>
              <div className="font-medium">${notary.hourlyRate}/hour</div>
            </div>
          </div>
        </CardContent>
        
        <div className="md:w-1/4 p-6 flex flex-col justify-between bg-gray-50">
          <div className="text-center mb-4">
            <span className="text-sm text-gray-500 block mb-1">Starting from</span>
            <span className="text-2xl font-bold">${notary.hourlyRate}</span>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                className="w-full"
                onClick={handleBooking}
              >
                Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Book an Appointment</DialogTitle>
                <DialogDescription>
                  Select a date and time to schedule your appointment with {notary.name}.
                </DialogDescription>
              </DialogHeader>
              <BookingForm notary={notary} />
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" className="mt-2">
            View Profile
          </Button>
        </div>
      </div>
    </Card>
  );
}