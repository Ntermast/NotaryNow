import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface AppointmentCardProps {
  appointment: {
    id: number | string;
    notaryName: string;
    service: string;
    date: string;
    time: string;
    location: string;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    cost: number;
    rated?: boolean;
    rating?: number;
  };
  onCancel?: (id: number | string) => void;
  onReschedule?: (id: number | string) => void;
  onReview?: (id: number | string, rating: number, comment: string) => void;
}

export function AppointmentCard({ appointment, onCancel, onReschedule, onReview }: AppointmentCardProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': 
        return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const handleReviewSubmit = () => {
    if (onReview) {
      onReview(appointment.id, rating, comment);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>{appointment.service}</CardTitle>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Badge>
        </div>
        <CardDescription>
          Notary: {appointment.notaryName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4 opacity-70" />
            <span>{formatDate(appointment.date)}</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4 opacity-70" />
            <span>{appointment.time}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4 opacity-70" />
            <span>{appointment.location}</span>
          </div>
          <div className="flex items-center text-sm font-semibold">
            <span>Total Cost: {appointment.cost.toLocaleString()} RWF</span>
          </div>
          {appointment.rated && (
            <div className="flex items-center text-sm">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < (appointment.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button variant="outline" size="sm">View Details</Button>
        
        {appointment.status === 'PENDING' && onCancel && (
          <Button variant="destructive" size="sm" onClick={() => onCancel(appointment.id)}>
            Cancel Request
          </Button>
        )}
        
        {appointment.status === 'CONFIRMED' && onReschedule && (
          <Button variant="outline" size="sm" onClick={() => onReschedule(appointment.id)}>
            Reschedule
          </Button>
        )}
        
        {appointment.status === 'COMPLETED' && !appointment.rated && onReview && (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">Leave Review</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Leave a Review</DialogTitle>
                <DialogDescription>
                  Share your experience with {appointment.notaryName}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4 space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Rating</p>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`h-6 w-6 cursor-pointer ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="comment" className="text-sm font-medium">
                    Comments
                  </label>
                  <Textarea
                    id="comment"
                    className="mt-1 h-24"
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" onClick={handleReviewSubmit} disabled={rating === 0}>
                  Submit Review
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}