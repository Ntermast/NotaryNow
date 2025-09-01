import { Button } from '@/components/ui/button';
import Link from 'next/link';
// import { Calendar } from '../ui/calendar';
import { Calendar, Search } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Professional Notary Services at Your Fingertips</h1>
              <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Book appointments with verified notaries in your area. Quick, convenient, and secure.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/notaries">
                <Button size="lg" className="px-8">Find a Notary</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="px-8">Become a Notary</Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[350px] w-full max-w-[500px] rounded-lg overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-80"></div>
              <div className="absolute inset-0 flex items-center justify-center p-6 text-white">
                {/* Booking widget preview */}
                <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm">
                  <div className="mb-4 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-2" />
                    <h3 className="text-xl font-bold">Book Your Appointment</h3>
                  </div>
                  <div className="rounded-lg bg-white/10 p-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Search className="h-4 w-4" />
                      <span>Find notaries near: Kigali, Rwanda</span>
                    </div>
                  </div>
                  <Button variant="secondary" className="w-full">Search Available Notaries</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}