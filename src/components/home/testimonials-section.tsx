import { Card, CardContent } from '@/components/ui/card';
import { Star, Users } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      text: "NotaryAvailability made getting my documents notarized so easy. I found a professional notary within minutes and had my appointment the same day!",
      name: "Sarah Thompson",
      location: "New York, NY"
    },
    {
      text: "As a notary, this platform has helped me grow my business significantly. The scheduling system is intuitive and clients love the convenience.",
      name: "Michael Chen",
      location: "San Francisco, CA"
    },
    {
      text: "I needed urgent notarization for a real estate closing. NotaryAvailability connected me with a qualified notary who accommodated my tight schedule.",
      name: "James Wilson",
      location: "Chicago, IL"
    }
  ];

  return (
    <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Customer Testimonials</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              See what our customers are saying about our service
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="flex flex-col p-6">
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <CardContent className="space-y-4 p-0">
                <p className="text-gray-500 italic">{testimonial.text}</p>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}