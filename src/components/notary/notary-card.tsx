import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { BookingForm } from './booking-form';

interface NotaryService {
  id: string;
  name: string;
  description?: string;
  price: number;
  basePrice: number;
  customPrice: number | null;
}

interface NotaryLocation {
  formatted: string;
  district?: string | null;
  sector?: string | null;
  province?: string | null;
}

interface NotaryCardProps {
  notary: {
    id: string;
    name: string;
    photo?: string | null;
    contactEmail?: string;
    notaryType?: "PUBLIC" | "PRIVATE";
    location: NotaryLocation;
    rating?: number | null;
    reviewCount: number;
    services: NotaryService[];
    serviceNames?: string[];
    availableForBooking?: boolean;
    startingPrice: number;
    availableToday: boolean;
    experienceYears: number;
    distanceKm: number | null;
  };
}

const formatCurrency = (value: number) =>
  Number.isFinite(value) ? `${value.toLocaleString()} RWF` : '—';

export function NotaryCard({ notary }: NotaryCardProps) {
  const initials = notary.name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const displayRating =
    typeof notary.rating === 'number' && Number.isFinite(notary.rating)
      ? notary.rating.toFixed(1)
      : '—';

  const featuredServices = notary.services.slice(0, 3);
  const remainingServiceCount = Math.max(notary.services.length - featuredServices.length, 0);
  const notaryTypeLabel =
    notary.notaryType === 'PUBLIC' ? 'Public Notary' : 'Private Notary';
  const bookingDisabled = notary.availableForBooking === false;

  return (
    <Card className="overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/4 p-6 flex flex-col items-center justify-center bg-gray-50 gap-2">
          <Avatar className="h-20 w-20">
            <AvatarImage src={notary.photo || undefined} alt={notary.name} />
            <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-center space-y-1">
            <h3 className="font-medium">{notary.name}</h3>
            <Badge variant="secondary">{notaryTypeLabel}</Badge>
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span>{displayRating}</span>
              <span className="text-gray-400">({notary.reviewCount} reviews)</span>
            </div>
            <div className="text-xs text-gray-500">
              {notary.experienceYears}+ years of experience
            </div>
          </div>
          {notary.availableToday && (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 mt-2">
              Available today
            </Badge>
          )}
        </div>

        <CardContent className="md:w-2/4 border-l border-r p-6 space-y-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Location</div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="flex items-center text-gray-700">
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                <span>{notary.location.formatted || 'Location pending'}</span>
              </div>
              {notary.location.district && (
                <Badge variant="outline" className="text-xs">
                  {notary.location.district} District
                </Badge>
              )}
              {notary.location.sector && (
                <Badge variant="outline" className="text-xs">
                  {notary.location.sector} Sector
                </Badge>
              )}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Popular services</div>
            <div className="flex flex-wrap gap-2">
              {featuredServices.map((service) => (
                <Badge key={service.id} variant="secondary" className="text-xs">
                  {service.name} • {formatCurrency(service.price)}
                </Badge>
              ))}
              {remainingServiceCount > 0 && (
                <Badge variant="outline" className="text-xs text-gray-600">
                  +{remainingServiceCount} more
                </Badge>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Starting price</div>
              <div className="font-semibold">{formatCurrency(notary.startingPrice)}</div>
            </div>
            <div>
              <div className="text-gray-500">Client rating</div>
              <div className="font-semibold">
                {displayRating}{' '}
                <span className="text-xs text-gray-500">({notary.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
        </CardContent>

        <div className="md:w-1/4 p-6 flex flex-col justify-between bg-gray-50">
          <div className="text-center mb-4 space-y-1">
            <span className="text-sm text-gray-500 block">Appointments from</span>
            <span className="text-2xl font-bold">{formatCurrency(notary.startingPrice)}</span>
          </div>

          {bookingDisabled ? (
            <div className="text-sm text-gray-500 text-center">
              <p>Services pending admin approval.</p>
              <p>Booking will be enabled once approved.</p>
            </div>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Book Appointment</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Book an Appointment</DialogTitle>
                  <DialogDescription>
                    Choose a date and time to meet with {notary.name}.
                  </DialogDescription>
                </DialogHeader>
                <BookingForm
                  notary={notary}
                  onClose={() => document.getElementById('close-dialog-btn')?.click()}
                />
                <button id="close-dialog-btn" className="hidden" aria-hidden="true"></button>
              </DialogContent>
            </Dialog>
          )}

          <Button variant="outline" className="mt-2">
            View Profile
          </Button>
        </div>
      </div>
    </Card>
  );
}
