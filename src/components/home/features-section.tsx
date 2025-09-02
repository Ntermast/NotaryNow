import { Card, CardContent } from '@/components/ui/card';
import { Search, Calendar, CheckCircle } from 'lucide-react';

export function FeaturesSection() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">How NotaryAvailability Works</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform connects you with professional notaries in minutes
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-3 md:gap-8">
          <Card className="flex flex-col items-center text-center p-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <CardContent className="space-y-2 p-0">
              <h3 className="text-xl font-bold">Search</h3>
              <p className="text-gray-500">Find verified notaries near you based on location and services needed</p>
            </CardContent>
          </Card>
          <Card className="flex flex-col items-center text-center p-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <CardContent className="space-y-2 p-0">
              <h3 className="text-xl font-bold">Book</h3>
              <p className="text-gray-500">Schedule an appointment at your convenience with transparent pricing</p>
            </CardContent>
          </Card>
          <Card className="flex flex-col items-center text-center p-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <CardContent className="space-y-2 p-0">
              <h3 className="text-xl font-bold">Notarize</h3>
              <p className="text-gray-500">Get your documents notarized professionally and efficiently</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}