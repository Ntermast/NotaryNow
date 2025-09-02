// src/components/layout/header.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <Link href="/" className="text-xl font-bold">NotaryAvailability</Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">Features</Link>
          <Link href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4">How It Works</Link>
          <Link href="#testimonials" className="text-sm font-medium hover:underline underline-offset-4">Testimonials</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/auth/signin">
            <Button variant="outline" size="sm">Login</Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm">Sign Up</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}