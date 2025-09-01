// src/components/layout/footer.tsx
import Link from 'next/link';
import { Calendar } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full py-6 md:py-12 bg-gray-900 text-gray-300">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-white">NotaryAvailability</span>
            </div>
            <p className="text-sm text-gray-400">Professional notary services across Rwanda at your fingertips.</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/notaries" className="hover:text-white transition-colors">Find a Notary</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">For Notaries</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/signup" className="hover:text-white transition-colors">Join Our Network</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Requirements</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Resources</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>support@notaryavailability.rw</li>
              <li>+250 788 123 456</li>
              <li>Kigali City Tower, Level 12</li>
              <li>Kigali, Rwanda</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} NotaryAvailability. All rights reserved.
        </div>
      </div>
    </footer>
  );
}