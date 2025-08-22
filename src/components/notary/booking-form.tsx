import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar, Clock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

export function BookingForm({ notary, onClose }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [bookingStage, setBookingStage] = useState(1); // 1: date & time, 2: service, 3: confirmation
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Generate available dates (next 14 days)
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    return {
      display: format(date, 'EEE, MMM d'),
      value: format(date, 'yyyy-MM-dd')
    };
  });

  // Available time slots
  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
  ];

  // Fetch notary's services with prices
  useEffect(() => {
    async function fetchServices() {
      try {
        // First, fetch all available services
        const servicesResponse = await fetch('/api/services');
        if (!servicesResponse.ok) throw new Error('Failed to fetch services');
        const allServices = await servicesResponse.json();
        
        // Filter services to only those the notary offers
        const notaryServices = allServices.filter(service => 
          notary.services.includes(service.name)
        );
        
        setServices(notaryServices);
        
        // Set the first service as selected by default if available
        if (notaryServices.length > 0) {
          setSelectedService(notaryServices[0].name);
          setSelectedServiceId(notaryServices[0].id);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    }
    
    fetchServices();
  }, [notary.services]);

  // Get price for a service
  const getServicePrice = (serviceName) => {
    const service = services.find(s => s.name === serviceName);
    return service ? service.basePrice : 0;
  };

  const handleBookingSubmit = async () => {
    if (status !== 'authenticated') {
      // Redirect to login if not authenticated
      toast.error('Please sign in to book an appointment');
      router.push('/auth/signin');
      return;
    }

    setLoading(true);
    
    try {
      console.log("Booking with:", { 
        selectedDate, 
        selectedTime, 
        notaryId: notary.id, 
        serviceId: selectedServiceId 
      });
      
      // Parse the time string to extract hours and minutes
      if (!selectedTime) {
        throw new Error('No time selected');
      }
      const timeMatch = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeMatch) {
        throw new Error(`Invalid time format: ${selectedTime}`);
      }
      
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2];
      const period = timeMatch[3].toUpperCase();
      
      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      // Create a date object with the correct local time
      if (!selectedDate) {
        throw new Error('No date selected');
      }
      const date = new Date(selectedDate + 'T00:00:00');
      date.setHours(hours, parseInt(minutes), 0, 0);
      
      console.log("Calculated date object:", date);
      
      // Create appointment
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notaryId: notary.id,
          serviceId: selectedServiceId,
          scheduledTime: date.toISOString(),
          duration: 60, // Default to 1 hour
          notes: '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server response:", errorData);
        throw new Error(errorData.error || 'Failed to book appointment');
      }
      
      const appointment = await response.json();
      console.log("Appointment created:", appointment);

      // Show success message
      setBookingSuccess(true);
      toast.success('Appointment booked successfully!');
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        router.push('/dashboard/customer');
        if (onClose) onClose();
      }, 3000);
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="py-8 text-center">
        <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-xl font-medium mb-2">Booking Confirmed!</h3>
        <p className="text-gray-500 mb-4">
          Your appointment has been scheduled. You'll receive a confirmation shortly.
        </p>
        <p className="text-sm text-gray-400">
          Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Stage 1: Date & Time Selection */}
      {bookingStage === 1 && (
        <>
          <Label className="mb-2 block">Select Date</Label>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {availableDates.map((date) => (
              <Button
                key={date.value}
                variant={selectedDate === date.value ? "default" : "outline"}
                className="flex flex-col h-auto py-2"
                onClick={() => setSelectedDate(date.value)}
              >
                <span className="text-xs text-gray-500">{date.display.split(',')[0]}</span>
                <span>{date.display.split(',')[1]}</span>
              </Button>
            ))}
          </div>
          
          <Label className="mb-2 block">Select Time</Label>
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                onClick={() => setSelectedTime(time)}
                className="text-sm"
              >
                {time}
              </Button>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button 
              type="button" 
              onClick={() => setBookingStage(2)}
              disabled={!selectedDate || !selectedTime}
            >
              Next
            </Button>
          </div>
        </>
      )}

      {/* Stage 2: Service Selection */}
      {bookingStage === 2 && (
        <>
          <Label className="mb-2 block">Select Service</Label>
          <div className="space-y-2">
            {services.map((service) => (
              <div 
                key={service.id} 
                className={`p-4 border rounded-lg cursor-pointer ${selectedService === service.name ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}
                onClick={() => {
                  setSelectedService(service.name);
                  setSelectedServiceId(service.id);
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-gray-500">
                      {service.description}
                    </p>
                  </div>
                  <div className="font-bold">
                    ${service.basePrice}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-between">
            <Button 
              variant="outline"
              onClick={() => setBookingStage(1)}
            >
              Back
            </Button>
            <Button 
              type="button" 
              onClick={() => setBookingStage(3)}
              disabled={!selectedService}
            >
              Next
            </Button>
          </div>
        </>
      )}

      {/* Stage 3: Summary & Confirmation */}
      {bookingStage === 3 && (
        <>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium mb-2">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Notary:</span>
                <span className="font-medium">{notary.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service:</span>
                <span className="font-medium">{selectedService}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium">
                  {availableDates.find(d => d.value === selectedDate)?.display || 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time:</span>
                <span className="font-medium">{selectedTime || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location:</span>
                <span className="font-medium">{notary.location}</span>
              </div>
              <div className="pt-2 border-t flex justify-between">
                <span className="font-medium">Total:</span>
                <span className="font-bold">${getServicePrice(selectedService)}</span>
              </div>
            </div>
          </div>
          
          {status !== 'authenticated' && (
            <div className="mb-4 p-3 border border-yellow-200 bg-yellow-50 rounded-md text-sm text-yellow-800">
              You'll need to sign in before confirming your booking.
            </div>
          )}
          
          <div className="mt-4 flex justify-between">
            <Button 
              variant="outline"
              onClick={() => setBookingStage(2)}
              disabled={loading}
            >
              Back
            </Button>
            <Button 
              type="button" 
              onClick={handleBookingSubmit}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}