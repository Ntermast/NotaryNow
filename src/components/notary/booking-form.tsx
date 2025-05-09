import { useState } from 'react';
import { Button } from '@/components/ui/button';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar, Clock } from 'lucide-react';

export function BookingForm({ notary }) {
  const [bookingStage, setBookingStage] = useState(1); // 1: date & time, 2: service, 3: confirmation
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedService, setSelectedService] = useState(notary.services[0]);

  // Available dates (normally would come from API)
  const availableDates = [
    { display: 'Mon, Mar 3', value: '2025-03-03' },
    { display: 'Tue, Mar 4', value: '2025-03-04' },
    { display: 'Wed, Mar 5', value: '2025-03-05' },
    { display: 'Thu, Mar 6', value: '2025-03-06' }
  ];

  // Available time slots (would normally come from API based on selected date)
  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  ];

  // Service prices (simplified example)
  const getServicePrice = (service) => {
    const prices = {
      'Deed Notarization': 45,
      'Power of Attorney': 65,
      'Mortgage Signing': 120,
      'Affidavit': 35,
      'Will & Trust': 95,
      'Certified Copies': 25
    };
    return prices[service] || 45;
  };

  const handleBookingSubmit = () => {
    // In a real application, this would send the booking to your API
    console.log('Booking submitted:', {
      notaryId: notary.id,
      date: selectedDate,
      time: selectedTime,
      service: selectedService
    });
    // Close dialog or show success message
  };

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
            {notary.services.map((service) => (
              <div 
                key={service} 
                className={`p-4 border rounded-lg cursor-pointer ${selectedService === service ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}
                onClick={() => setSelectedService(service)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{service}</h4>
                    <p className="text-sm text-gray-500">
                      {service === 'Deed Notarization' && 'Notarization of property deeds'}
                      {service === 'Power of Attorney' && 'Legal document authorization'}
                      {service === 'Mortgage Signing' && 'Mortgage document signing'}
                      {service === 'Affidavit' && 'Written sworn statement'}
                      {service === 'Will & Trust' && 'Estate planning documents'}
                      {service === 'Certified Copies' && 'Certified document copies'}
                    </p>
                  </div>
                  <div className="font-bold">
                    ${getServicePrice(service)}
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
          
          <div className="mt-4 flex justify-between">
            <Button 
              variant="outline"
              onClick={() => setBookingStage(2)}
            >
              Back
            </Button>
            <Button 
              type="button" 
              onClick={handleBookingSubmit}
            >
              Confirm Booking
            </Button>
          </div>
        </>
      )}
    </div>
  );
}