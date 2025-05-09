# Documentation of the Next.js application src

*Documentation generated on 02/03/2025 at 17:19:53*


## File Structure


#### 📄 middleware.ts

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthenticated = !!token;

  // Get the pathname from the URL
  const path = request.nextUrl.pathname;

  // Define protected routes that require authentication
  const protectedRoutes = ["/dashboard"];

  // Check if the path is a protected route and the user is not authenticated
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to sign-in page if trying to access a protected route without authentication
    const redirectUrl = new URL("/auth/signin", request.url);
    redirectUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(redirectUrl);
  }

  // Role-based access control
  if (isAuthenticated && path.startsWith("/dashboard")) {
    const userRole = token.role as string;
    
    // Check if the user is trying to access a different role's dashboard
    if (
      (path.startsWith("/dashboard/admin") && userRole !== "ADMIN") ||
      (path.startsWith("/dashboard/notary") && userRole !== "NOTARY") ||
      (path.startsWith("/dashboard/customer") && userRole !== "CUSTOMER") ||
      (path.startsWith("/dashboard/secretary") && userRole !== "SECRETARY")
    ) {
      // Redirect to their own role's dashboard
      return NextResponse.redirect(
        new URL(`/dashboard/${userRole.toLowerCase()}`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip authentication for static files and API routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```


### 📁 types


#### 📄 next-auth.d.ts

```typescript
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
```


### 📁 app


#### 📄 globals.css

```css
@import "tailwindcss";

@plugin "tailwindcss-animate";

@custom-variant dark (&:is(.dark *));

@theme {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.129 0.042 264.695);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.129 0.042 264.695);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.129 0.042 264.695);
  --primary: oklch(0.208 0.042 265.755);
  --primary-foreground: oklch(0.984 0.003 247.858);
  --secondary: oklch(0.968 0.007 247.896);
  --secondary-foreground: oklch(0.208 0.042 265.755);
  --muted: oklch(0.968 0.007 247.896);
  --muted-foreground: oklch(0.554 0.046 257.417);
  --accent: oklch(0.968 0.007 247.896);
  --accent-foreground: oklch(0.208 0.042 265.755);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.929 0.013 255.508);
  --input: oklch(0.929 0.013 255.508);
  --ring: oklch(0.704 0.04 256.788);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.984 0.003 247.858);
  --sidebar-foreground: oklch(0.129 0.042 264.695);
  --sidebar-primary: oklch(0.208 0.042 265.755);
  --sidebar-primary-foreground: oklch(0.984 0.003 247.858);
  --sidebar-accent: oklch(0.968 0.007 247.896);
  --sidebar-accent-foreground: oklch(0.208 0.042 265.755);
  --sidebar-border: oklch(0.929 0.013 255.508);
  --sidebar-ring: oklch(0.704 0.04 256.788);
}

.dark {
  --background: oklch(0.129 0.042 264.695);
  --foreground: oklch(0.984 0.003 247.858);
  --card: oklch(0.129 0.042 264.695);
  --card-foreground: oklch(0.984 0.003 247.858);
  --popover: oklch(0.129 0.042 264.695);
  --popover-foreground: oklch(0.984 0.003 247.858);
  --primary: oklch(0.984 0.003 247.858);
  --primary-foreground: oklch(0.208 0.042 265.755);
  --secondary: oklch(0.279 0.041 260.031);
  --secondary-foreground: oklch(0.984 0.003 247.858);
  --muted: oklch(0.279 0.041 260.031);
  --muted-foreground: oklch(0.704 0.04 256.788);
  --accent: oklch(0.279 0.041 260.031);
  --accent-foreground: oklch(0.984 0.003 247.858);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.279 0.041 260.031);
  --input: oklch(0.279 0.041 260.031);
  --ring: oklch(0.446 0.043 257.281);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.208 0.042 265.755);
  --sidebar-foreground: oklch(0.984 0.003 247.858);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.984 0.003 247.858);
  --sidebar-accent: oklch(0.279 0.041 260.031);
  --sidebar-accent-foreground: oklch(0.984 0.003 247.858);
  --sidebar-border: oklch(0.279 0.041 260.031);
  --sidebar-ring: oklch(0.446 0.043 257.281);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```


#### 📄 layout.tsx

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/providers/auth-provider";
import { ToastProvider } from "@/components/ui/use-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```


#### 📄 page.tsx

```typescript
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturesSection } from '@/components/home/features-section';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { CTASection } from '@/components/home/cta-section';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen mx-auto">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
```


### 📁 app/auth


### 📁 app/auth/signin


#### 📄 page.tsx

```typescript
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar, AtSign, KeyRound } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      // Redirect based on user role
      router.push("/dashboard/customer");
      router.refresh();
    } catch (error) {
      setError(`An error occurred. Please try again: ${error}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Sign in to NotaryNow</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm mt-4">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
```


### 📁 app/notaries


#### 📄 page.tsx

```typescript
'use client';

import { useState } from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { NotaryFilter } from '@/components/notary/notary-filter';
import { NotaryCard } from '@/components/notary/notary-card';
import { Search } from 'lucide-react';

// This would typically come from an API
const MOCK_NOTARIES = [
  {
    id: 1,
    name: 'John Smith',
    photo: '',
    rating: 4.9,
    reviewCount: 124,
    location: 'Manhattan, New York',
    distance: 1.2,
    hourlyRate: 75,
    services: ['Deed Notarization', 'Power of Attorney', 'Mortgage Signing'],
    availableToday: true,
    experience: 7
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    photo: '',
    rating: 4.8,
    reviewCount: 89,
    location: 'Brooklyn, New York',
    distance: 2.5,
    hourlyRate: 65,
    services: ['Deed Notarization', 'Affidavit', 'Will & Trust'],
    availableToday: false,
    experience: 5
  },
  {
    id: 3,
    name: 'Michael Brown',
    photo: '',
    rating: 4.7,
    reviewCount: 56,
    location: 'Queens, New York',
    distance: 3.8,
    hourlyRate: 60,
    services: ['Mortgage Signing', 'Deed Notarization', 'Certified Copies'],
    availableToday: true,
    experience: 3
  },
  {
    id: 4,
    name: 'Emily Davis',
    photo: '',
    rating: 5.0,
    reviewCount: 42,
    location: 'Bronx, New York',
    distance: 4.1,
    hourlyRate: 70,
    services: ['Power of Attorney', 'Will & Trust', 'Affidavit'],
    availableToday: false,
    experience: 6
  }
];

export default function NotarySearchPage() {
  const [notaries, setNotaries] = useState(MOCK_NOTARIES);
  const [sortOption, setSortOption] = useState('rating');
  const [filters, setFilters] = useState({});

  const handleFilterChange = (newFilters) => {
    console.log('Filters applied:', newFilters);
    // In a real app, you would fetch new results from API with these filters
    // For now, we'll just simulate filtering
    const filtered = MOCK_NOTARIES.filter(notary => {
      if (newFilters.service !== 'All Services' && !notary.services.includes(newFilters.service)) {
        return false;
      }
      if (notary.distance > newFilters.maxDistance) {
        return false;
      }
      if (notary.hourlyRate > newFilters.maxRate) {
        return false;
      }
      return true;
    });
    
    setNotaries(filtered);
    setFilters(newFilters);
  };

  const handleSortChange = (value) => {
    setSortOption(value);
    
    // Sort the notaries based on the selected option
    const sorted = [...notaries].sort((a, b) => {
      if (value === 'distance') return a.distance - b.distance;
      if (value === 'rating') return b.rating - a.rating;
      if (value === 'price') return a.hourlyRate - b.hourlyRate;
      if (value === 'experience') return b.experience - a.experience;
      return 0;
    });
    
    setNotaries(sorted);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Find a Notary</h1>
        
        <NotaryFilter onFilterChange={handleFilterChange} />
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">
              {notaries.length} Notaries Found
            </h2>
            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger className="w-auto">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="price">Price (Low to High)</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {notaries.map(notary => (
            <NotaryCard key={notary.id} notary={notary} />
          ))}
          
          {notaries.length === 0 && (
            <Card className="text-center p-8">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <CardTitle className="mb-2">No Notaries Found</CardTitle>
              <CardDescription>
                Try adjusting your filters or search in a different location.
              </CardDescription>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
```


### 📁 app/dashboard


### 📁 app/dashboard/notary


#### 📄 page.tsx

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger, TabsContent, Tabs } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Calendar, Clock, BookOpen, BellIcon, SettingsIcon, DollarSign, Users, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";

export default function NotaryDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    revenue: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not authenticated or not a notary
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "NOTARY") {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    }
  }, [status, session, router]);

  useEffect(() => {
    async function fetchAppointments() {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/appointments");
          if (!response.ok) throw new Error("Failed to fetch appointments");
          
          const data = await response.json();
          setAppointments(data);
          
          // Calculate stats
          const totalAppointments = data.length;
          const pendingAppointments = data.filter(
            (app) => app.status === "pending"
          ).length;
          const completedAppointments = data.filter(
            (app) => app.status === "completed"
          ).length;
          const revenue = data
            .filter((app) => app.status === "completed")
            .reduce((sum, app) => sum + app.totalCost, 0);
          
          // Calculate average rating
          const ratings = data
            .filter((app) => app.reviews.length > 0)
            .map((app) => app.reviews[0].rating);
          const averageRating =
            ratings.length > 0
              ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
              : 0;
          
          setStats({
            totalAppointments,
            pendingAppointments,
            completedAppointments,
            revenue,
            averageRating,
          });
          
          setLoading(false);
        } catch (error) {
          console.error("Error fetching appointments:", error);
          setLoading(false);
        }
      }
    }

    fetchAppointments();
  }, [status]);

  const handleAppointmentStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update appointment");

      // Update the appointment in the local state
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "denied": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "authenticated" && session.user.role === "NOTARY") {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          userRole="notary"
          userName={session.user.name}
          userEmail={session.user.email}
        />

        <div className="md:pl-64 flex flex-col flex-1">
          {/* Top navbar */}
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
            <div className="flex flex-1 justify-between px-4 md:px-6">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">Notary Dashboard</h1>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <BellIcon className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="outline" size="icon">
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Dashboard content */}
          <main className="flex-1 pb-8">
            <div className="mt-8 px-4 sm:px-6 lg:px-8">
              {/* Stats cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Appointments"
                  value={stats.totalAppointments}
                  icon={Calendar}
                />
                <StatsCard
                  title="Pending Requests"
                  value={stats.pendingAppointments}
                  icon={Clock}
                />
                <StatsCard
                  title="Revenue"
                  value={`$${stats.revenue}`}
                  icon={DollarSign}
                />
                <StatsCard
                  title="Average Rating"
                  value={stats.averageRating.toFixed(1)}
                  icon={Star}
                />
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button className="h-auto py-6 flex flex-col items-center justify-center gap-2">
                    <Calendar className="h-6 w-6" />
                    <span>Manage Schedule</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-2">
                    <Users className="h-6 w-6" />
                    <span>View Customers</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-2">
                    <BookOpen className="h-6 w-6" />
                    <span>Service Offerings</span>
                  </Button>
                </div>
              </div>

              {/* Appointments */}
              <div className="mt-8">
                <Tabs defaultValue="pending">
                  <TabsList className="mb-4">
                    <TabsTrigger value="pending">Pending Requests</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pending">
                    <div className="space-y-4">
                      {appointments
                        .filter((app) => app.status === "pending")
                        .map((appointment) => (
                          <Card key={appointment.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle>{appointment.service.name}</CardTitle>
                                <Badge 
                                  className={getStatusBadgeClass(appointment.status)}>
                                  Pending
                                </Badge>
                              </div>
                              <CardDescription>
                                Customer: {appointment.customer.name}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-2">
                                <div className="flex items-center text-sm">
                                  <Calendar className="mr-2 h-4 w-4 opacity-70" />
                                  <span>
                                    {new Date(
                                      appointment.scheduledTime
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Clock className="mr-2 h-4 w-4 opacity-70" />
                                  <span>
                                    {new Date(
                                      appointment.scheduledTime
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm font-semibold">
                                  <span>Fee: ${appointment.totalCost}</span>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="border-t pt-4 flex justify-between">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => 
                                  handleAppointmentStatusChange(
                                    appointment.id, 
                                    "denied"
                                  )
                                }
                              >
                                Decline
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => 
                                  handleAppointmentStatusChange(
                                    appointment.id, 
                                    "approved"
                                  )
                                }
                              >
                                Accept
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}

                      {appointments.filter(
                        (app) => app.status === "pending"
                      ).length === 0 && (
                        <Card>
                          <CardContent className="py-8 text-center">
                            <p className="text-gray-500">
                              No pending appointment requests
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="upcoming">
                    <div className="space-y-4">
                      {appointments
                        .filter((app) => app.status === "approved")
                        .map((appointment) => (
                          <Card key={appointment.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle>{appointment.service.name}</CardTitle>
                                <Badge
                                  className={getStatusBadgeClass(appointment.status)}
                                >
                                  Approved
                                </Badge>
                              </div>
                              <CardDescription>
                                Customer: {appointment.customer.name}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-2">
                                <div className="flex items-center text-sm">
                                  <Calendar className="mr-2 h-4 w-4 opacity-70" />
                                  <span>
                                    {new Date(
                                      appointment.scheduledTime
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Clock className="mr-2 h-4 w-4 opacity-70" />
                                  <span>
                                    {new Date(
                                      appointment.scheduledTime
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm font-semibold">
                                  <span>Fee: ${appointment.totalCost}</span>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="border-t pt-4 flex justify-between">
                              <Button 
                                variant="outline" 
                                size="sm"
                              >
                                Reschedule
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => 
                                  handleAppointmentStatusChange(
                                    appointment.id, 
                                    "completed"
                                  )
                                }
                              >
                                Mark as Completed
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}

                      {appointments.filter(
                        (app) => app.status === "approved"
                      ).length === 0 && (
                        <Card>
                          <CardContent className="py-8 text-center">
                            <p className="text-gray-500">
                              No upcoming appointments
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="completed">
                    <div className="space-y-4">
                      {appointments
                        .filter((app) => app.status === "completed")
                        .map((appointment) => (
                          <Card key={appointment.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle>{appointment.service.name}</CardTitle>
                                <Badge
                                  className={getStatusBadgeClass(appointment.status)}
                                >
                                  Completed
                                </Badge>
                              </div>
                              <CardDescription>
                                Customer: {appointment.customer.name}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-2">
                                <div className="flex items-center text-sm">
                                  <Calendar className="mr-2 h-4 w-4 opacity-70" />
                                  <span>
                                    {new Date(
                                      appointment.scheduledTime
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Clock className="mr-2 h-4 w-4 opacity-70" />
                                  <span>
                                    {new Date(
                                      appointment.scheduledTime
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm font-semibold">
                                  <span>Fee: ${appointment.totalCost}</span>
                                </div>
                                {appointment.reviews.length > 0 && (
                                  <div className="flex items-center mt-2">
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map((starIndex) => (
                                        <Star
                                          key={starIndex}
                                          className={`h-4 w-4 ${
                                            starIndex <= appointment.reviews[0].rating
                                              ? "text-yellow-400 fill-yellow-400"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="ml-2 text-sm">
                                      {appointment.reviews[0].comment}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter className="border-t pt-4">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="w-full"
                              >
                                View Details
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}

                      {appointments.filter(
                        (app) => app.status === "completed"
                      ).length === 0 && (
                        <Card>
                          <CardContent className="py-8 text-center">
                            <p className="text-gray-500">
                              No completed appointments
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return null;
}
```


### 📁 app/dashboard/notary/settings


#### 📄 page.tsx

```typescript
// src/app/dashboard/notary/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { BellIcon, SettingsIcon } from "lucide-react";
import { toast } from "sonner";
// import { toast } from "@/components/ui/use-toast";

export default function NotarySettings() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [services, setServices] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Redirect if not authenticated or not a notary
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (status === "authenticated" && session.user.role !== "NOTARY") {
            router.push(`/dashboard/${session.user.role.toLowerCase()}`);
        }
    }, [status, session, router]);

    useEffect(() => {
        async function fetchNotaryProfile() {
            if (status === "authenticated") {
                try {
                    // Fetch profile data
                    const profileResponse = await fetch("/api/notary/profile");
                    if (!profileResponse.ok) throw new Error("Failed to fetch profile");
                    const profileData = await profileResponse.json();
                    setProfile(profileData);

                    // Fetch services
                    const servicesResponse = await fetch("/api/services");
                    if (!servicesResponse.ok) throw new Error("Failed to fetch services");
                    const servicesData = await servicesResponse.json();
                    setServices(servicesData);

                    // Fetch certifications
                    const certificationsResponse = await fetch("/api/certifications");
                    if (!certificationsResponse.ok) throw new Error("Failed to fetch certifications");
                    const certificationsData = await certificationsResponse.json();
                    setCertifications(certificationsData);

                    setLoading(false);
                } catch (error) {
                    console.error("Error fetching data:", error);
                    setLoading(false);
                }
            }
        }

        fetchNotaryProfile();
    }, [status]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const response = await fetch("/api/notary/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    address: profile.address,
                    city: profile.city,
                    state: profile.state,
                    zip: profile.zip,
                    hourlyRate: profile.hourlyRate,
                    bio: profile.bio,
                }),
            });

            if (!response.ok) throw new Error("Failed to update profile");

            toast({
                title: "Profile updated",
                description: "Your profile has been successfully updated",
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                title: "Update failed",
                description: "There was an error updating your profile",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleServiceToggle = async (serviceId, isChecked) => {
        try {
            const method = isChecked ? "POST" : "DELETE";

            const response = await fetch(`/api/notary/services/${serviceId}`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error(`Failed to ${isChecked ? 'add' : 'remove'} service`);

            // Update the UI
            setProfile(prev => ({
                ...prev,
                notaryServices: isChecked
                    ? [...prev.notaryServices, { serviceId }]
                    : prev.notaryServices.filter(s => s.serviceId !== serviceId)
            }));

            toast({
                title: isChecked ? "Service added" : "Service removed",
                description: `The service has been ${isChecked ? 'added to' : 'removed from'} your profile`,
            });
        } catch (error) {
            console.error("Error toggling service:", error);
            toast({
                title: "Action failed",
                description: `Failed to ${isChecked ? 'add' : 'remove'} the service`,
                variant: "destructive",
            });
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (status === "authenticated" && session.user.role === "NOTARY" && profile) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar
                    userRole="notary"
                    userName={session.user.name}
                    userEmail={session.user.email}
                />

                <div className="md:pl-64 flex flex-col flex-1">
                    {/* Top navbar */}
                    <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
                        <div className="flex flex-1 justify-between px-4 md:px-6">
                            <div className="flex items-center">
                                <h1 className="text-xl font-semibold">Account Settings</h1>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm">
                                    <BellIcon className="h-4 w-4 mr-2" />
                                    Notifications
                                </Button>
                                <Button variant="outline" size="icon">
                                    <SettingsIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Settings content */}
                    <main className="flex-1 pb-8">
                        <div className="mt-8 px-4 sm:px-6 lg:px-8">
                            <Tabs defaultValue="profile">
                                <TabsList className="mb-6">
                                    <TabsTrigger value="profile">Profile</TabsTrigger>
                                    <TabsTrigger value="services">Services</TabsTrigger>
                                    <TabsTrigger value="certifications">Certifications</TabsTrigger>
                                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                                </TabsList>

                                <TabsContent value="profile">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Profile Information</CardTitle>
                                            <CardDescription>
                                                Update your profile information and address
                                            </CardDescription>
                                        </CardHeader>
                                        <form onSubmit={handleProfileUpdate}>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="address">Address</Label>
                                                        <Input
                                                            id="address"
                                                            value={profile.address}
                                                            onChange={(e) =>
                                                                setProfile({ ...profile, address: e.target.value })
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="city">City</Label>
                                                        <Input
                                                            id="city"
                                                            value={profile.city}
                                                            onChange={(e) =>
                                                                setProfile({ ...profile, city: e.target.value })
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="state">State</Label>
                                                        <Input
                                                            id="state"
                                                            value={profile.state}
                                                            onChange={(e) =>
                                                                setProfile({ ...profile, state: e.target.value })
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="zip">ZIP Code</Label>
                                                        <Input
                                                            id="zip"
                                                            value={profile.zip}
                                                            onChange={(e) =>
                                                                setProfile({ ...profile, zip: e.target.value })
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                                                    <Input
                                                        id="hourlyRate"
                                                        type="number"
                                                        value={profile.hourlyRate}
                                                        onChange={(e) =>
                                                            setProfile({
                                                                ...profile,
                                                                hourlyRate: parseFloat(e.target.value),
                                                            })
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="bio">Bio</Label>
                                                    <Textarea
                                                        id="bio"
                                                        value={profile.bio || ""}
                                                        onChange={(e) =>
                                                            setProfile({ ...profile, bio: e.target.value })
                                                        }
                                                        rows={4}
                                                        placeholder="Tell customers about your experience and expertise"
                                                    />
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Button type="submit" disabled={isSaving}>
                                                    {isSaving ? "Saving..." : "Save Changes"}
                                                </Button>
                                            </CardFooter>
                                        </form>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="services">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Services Offered</CardTitle>
                                            <CardDescription>
                                                Select the services you provide to customers
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {services.map((service) => (
                                                    <div key={service.id} className="flex items-start space-x-3">
                                                        <Checkbox
                                                            id={`service-${service.id}`}
                                                            checked={profile.notaryServices.some(
                                                                (s) => s.serviceId === service.id
                                                            )}
                                                            onCheckedChange={(checked) =>
                                                                handleServiceToggle(service.id, checked)
                                                            }
                                                        />
                                                        <div className="grid gap-1.5">
                                                            <Label
                                                                htmlFor={`service-${service.id}`}
                                                                className="font-medium"
                                                            >
                                                                {service.name} - ${service.basePrice}
                                                            </Label>
                                                            <p className="text-sm text-gray-500">
                                                                {service.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="certifications">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Certifications & Licenses</CardTitle>
                                            <CardDescription>
                                                Manage your professional certifications
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {certifications.map((cert) => (
                                                    <div key={cert.id} className="border rounded-lg p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h3 className="font-medium">{cert.name}</h3>
                                                                <p className="text-sm text-gray-500">
                                                                    {cert.description}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <Button variant="outline" size="sm">
                                                                    {profile.certifications.some(
                                                                        (c) => c.certificationId === cert.id
                                                                    )
                                                                        ? "Update"
                                                                        : "Add"}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        {profile.certifications.some(
                                                            (c) => c.certificationId === cert.id
                                                        ) && (
                                                                <div className="mt-3 pt-3 border-t">
                                                                    <p className="text-sm">
                                                                        <span className="font-medium">
                                                                            Issued on:{" "}
                                                                        </span>
                                                                        {new Date(
                                                                            profile.certifications.find(
                                                                                (c) => c.certificationId === cert.id
                                                                            ).dateObtained
                                                                        ).toLocaleDateString()}
                                                                    </p>
                                                                    {profile.certifications.find(
                                                                        (c) => c.certificationId === cert.id
                                                                    ).documentUrl && (
                                                                            <p className="text-sm mt-1">
                                                                                <a
                                                                                    href="#"
                                                                                    className="text-primary hover:underline"
                                                                                >
                                                                                    View Document
                                                                                </a>
                                                                            </p>
                                                                        )}
                                                                </div>
                                                            )}
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button variant="outline">Upload New Certification</Button>
                                        </CardFooter>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="schedule">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Availability Schedule</CardTitle>
                                            <CardDescription>
                                                Set your working hours and availability
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-6">
                                                {/* Days of the week */}
                                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                                    <div key={day} className="border rounded-lg p-4">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center space-x-3">
                                                                <Checkbox id={`available-${day.toLowerCase()}`} />
                                                                <Label htmlFor={`available-${day.toLowerCase()}`} className="font-medium">
                                                                    {day}
                                                                </Label>
                                                            </div>
                                                            <div>
                                                                <Button variant="outline" size="sm">
                                                                    Add Time Slot
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Time slots - In a real app, these would be dynamically rendered based on stored schedule */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div className="flex space-x-3 items-center border rounded p-2">
                                                                <div className="flex-1">
                                                                    <span className="text-sm font-medium">9:00 AM - 12:00 PM</span>
                                                                </div>
                                                                <Button variant="ghost" size="sm" className="text-red-500 h-8 w-8 p-0">
                                                                    ×
                                                                </Button>
                                                            </div>
                                                            <div className="flex space-x-3 items-center border rounded p-2">
                                                                <div className="flex-1">
                                                                    <span className="text-sm font-medium">1:00 PM - 5:00 PM</span>
                                                                </div>
                                                                <Button variant="ghost" size="sm" className="text-red-500 h-8 w-8 p-0">
                                                                    ×
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button type="button">Save Schedule</Button>
                                        </CardFooter>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return null;
}
```


### 📁 app/dashboard/customer


#### 📄 page.tsx

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger, TabsContent, Tabs } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, BellIcon, SettingsIcon } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { StatsCard } from '@/components/dashboard/stats-card';
import { AppointmentCard } from '@/components/dashboard/appointment-card';
import { QuickActions } from '@/components/dashboard/quick-actions';

// This would normally come from an API
const MOCK_UPCOMING_APPOINTMENTS = [
  {
    id: 1,
    notaryName: 'John Smith',
    service: 'Deed Notarization',
    date: '2025-03-05',
    time: '10:00 AM',
    location: '123 Main St, Suite 101',
    status: 'approved',
    cost: 45
  },
  {
    id: 2,
    notaryName: 'Sarah Johnson',
    service: 'Power of Attorney',
    date: '2025-03-10',
    time: '2:30 PM',
    location: '456 Oak Ave',
    status: 'pending',
    cost: 65
  }
];

const MOCK_PAST_APPOINTMENTS = [
  {
    id: 3,
    notaryName: 'Michael Brown',
    service: 'Mortgage Signing',
    date: '2025-02-15',
    time: '9:00 AM',
    location: '789 Pine Rd',
    status: 'completed',
    cost: 120,
    rated: true,
    rating: 5
  },
  {
    id: 4,
    notaryName: 'Emily Davis',
    service: 'Affidavit Notarization',
    date: '2025-02-01',
    time: '11:30 AM',
    location: '345 Maple St',
    status: 'completed',
    cost: 35,
    rated: false
  }
];

export default function CustomerDashboard() {
  const [upcomingAppointments, setUpcomingAppointments] = useState(MOCK_UPCOMING_APPOINTMENTS);
  const [pastAppointments, setPastAppointments] = useState(MOCK_PAST_APPOINTMENTS);

  const handleCancelAppointment = (id) => {
    // In a real app, this would make an API call
    console.log(`Cancelling appointment ${id}`);
    
    // Update local state to simulate API response
    setUpcomingAppointments(prev => 
      prev.map(app => 
        app.id === id ? { ...app, status: 'cancelled' } : app
      )
    );
  };

  const handleRescheduleAppointment = (id) => {
    // In a real app, this would open a reschedule dialog and make an API call
    console.log(`Rescheduling appointment ${id}`);
  };

  const handleReviewSubmit = (id, rating, comment) => {
    // In a real app, this would make an API call
    console.log(`Submitting review for appointment ${id}:`, { rating, comment });
    
    // Update local state to simulate API response
    setPastAppointments(prev => 
      prev.map(app => 
        app.id === id ? { ...app, rated: true, rating } : app
      )
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        userRole="customer" 
        userName="Jane Doe" 
        userEmail="jane.doe@example.com" 
      />

      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top navbar */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
          <div className="flex flex-1 justify-between px-4 md:px-6">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <BellIcon className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="icon">
                <SettingsIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <main className="flex-1 pb-8">
          <div className="mt-8 px-4 sm:px-6 lg:px-8">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <StatsCard 
                title="Total Appointments" 
                value={upcomingAppointments.length + pastAppointments.length}
                icon={Calendar}
              />
              <StatsCard 
                title="Upcoming" 
                value={upcomingAppointments.length}
                icon={Clock}
              />
              <StatsCard 
                title="Pending Review" 
                value={pastAppointments.filter(a => !a.rated && a.status === 'completed').length}
                icon={Calendar}
              />
            </div>

            <QuickActions />

            {/* Appointments */}
            <div className="mt-8">
              <Tabs defaultValue="upcoming">
                <TabsList className="mb-4">
                  <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
                  <TabsTrigger value="past">Past Appointments</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming">
                  <div className="space-y-4">
                    {upcomingAppointments.length > 0 ? (
                      upcomingAppointments.map((appointment) => (
                        <AppointmentCard 
                          key={appointment.id} 
                          appointment={appointment}
                          onCancel={appointment.status === 'pending' ? handleCancelAppointment : undefined}
                          onReschedule={appointment.status === 'approved' ? handleRescheduleAppointment : undefined}
                        />
                      ))
                    ) : (
                      <Card>
                        <CardContent className="py-8 text-center">
                          <p className="text-gray-500">You have no upcoming appointments</p>
                          <Button className="mt-4">Schedule an Appointment</Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="past">
                  <div className="space-y-4">
                    {pastAppointments.length > 0 ? (
                      pastAppointments.map((appointment) => (
                        <AppointmentCard 
                          key={appointment.id} 
                          appointment={appointment}
                          onReview={!appointment.rated && appointment.status === 'completed' ? handleReviewSubmit : undefined}
                        />
                      ))
                    ) : (
                      <Card>
                        <CardContent className="py-8 text-center">
                          <p className="text-gray-500">You have no past appointments</p>
                          <Button className="mt-4">Find a Notary</Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
```


### 📁 app/api


### 📁 app/api/appointments


#### 📄 route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import getServerSession from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    // Build where clause
    let where: any = {};

    // Filter appointments based on user role and status
    if (userRole === "CUSTOMER") {
      where.customerId = userId;
    } else if (userRole === "NOTARY") {
      where.notaryId = userId;
    } else if (userRole !== "ADMIN" && userRole !== "SECRETARY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (status && status !== "all") {
      where.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        notary: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: true,
        reviews: true,
      },
      orderBy: {
        scheduledTime: "desc",
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const { notaryId, serviceId, scheduledTime, duration, notes } = body;

    if (!notaryId || !serviceId || !scheduledTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get service price
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        customerId: userId,
        notaryId,
        serviceId,
        scheduledTime: new Date(scheduledTime),
        duration: duration || 60, // Default to 1 hour
        status: "pending",
        totalCost: service.basePrice,
        notes: notes || "",
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        notary: {
          select: {
            name: true,
            email: true,
          },
        },
        service: true,
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
```


### 📁 app/api/appointments/[id]


#### 📄 route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import getServerSession from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    const appointment = await prisma.appointment.findUnique({
      where: {
        id: params.id,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        notary: {
          select: {
            id: true,
            name: true,
            email: true,
            notaryProfile: {
              select: {
                address: true,
                city: true,
                state: true,
                zip: true,
              },
            },
          },
        },
        service: true,
        reviews: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this appointment
    if (
      userRole !== "ADMIN" &&
      userRole !== "SECRETARY" &&
      appointment.customerId !== userId &&
      appointment.notaryId !== userId
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;
    const body = await request.json();

    const { status, rescheduledTime, notes } = body;

    const appointment = await prisma.appointment.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check permissions for update
    const isCustomer = appointment.customerId === userId;
    const isNotary = appointment.notaryId === userId;
    const isAdminOrSecretary = userRole === "ADMIN" || userRole === "SECRETARY";

    if (!isCustomer && !isNotary && !isAdminOrSecretary) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Only certain roles can update certain fields
    const updateData: any = {};

    if (status) {
      // Customers can only cancel their appointments
      if (isCustomer && status !== "cancelled") {
        return NextResponse.json(
          { error: "Customers can only cancel appointments" },
          { status: 403 }
        );
      }

      // Notaries can approve, deny, or complete
      if (isNotary && !["approved", "denied", "completed"].includes(status)) {
        return NextResponse.json(
          { error: "Invalid status for notary" },
          { status: 403 }
        );
      }

      updateData.status = status;
    }

    if (rescheduledTime) {
      // Only allow rescheduling if appointment is not completed or cancelled
      if (["completed", "cancelled"].includes(appointment.status)) {
        return NextResponse.json(
          { error: "Cannot reschedule completed or cancelled appointments" },
          { status: 400 }
        );
      }

      updateData.scheduledTime = new Date(rescheduledTime);
    }

    if (notes) {
      updateData.notes = notes;
    }

    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: params.id,
      },
      data: updateData,
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        notary: {
          select: {
            name: true,
            email: true,
          },
        },
        service: true,
      },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}
```


### 📁 app/api/auth


### 📁 app/api/auth/[...nextauth]


#### 📄 route.ts

```typescript
import NextAuthOptions from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```


### 📁 app/api/notaries


#### 📄 route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import getServerSession from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const zipCode = searchParams.get("zipCode");
    const service = searchParams.get("service");
    const maxDistance = searchParams.get("maxDistance");
    const maxRate = searchParams.get("maxRate");

    // Build where clause
    const where: any = {
      isApproved: true,
    };

    // Filter by location/zip if provided
    if (zipCode) {
      where.OR = [
        { city: { contains: zipCode, mode: "insensitive" } },
        { state: { contains: zipCode, mode: "insensitive" } },
        { zip: { contains: zipCode, mode: "insensitive" } },
      ];
    }

    // Filter by hourly rate if provided
    if (maxRate) {
      where.hourlyRate = { lte: parseFloat(maxRate) };
    }

    // Query notary profiles
    const notaryProfiles = await prisma.notaryProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        notaryServices: {
          include: {
            service: true,
          },
        },
        certifications: {
          include: {
            certification: true,
          },
        },
      },
    });

    // Filter by service if provided
    let filteredProfiles = notaryProfiles;
    if (service && service !== "All Services") {
      filteredProfiles = notaryProfiles.filter((profile) =>
        profile.notaryServices.some((ns) => ns.service.name === service)
      );
    }

    // Transform data for the frontend
    const notaries = filteredProfiles.map((profile) => ({
      id: profile.user.id,
      name: profile.user.name,
      photo: "", // You might want to add photo field later
      location: `${profile.city}, ${profile.state}`,
      distance: 2.5, // This would need actual geocoding to calculate
      hourlyRate: profile.hourlyRate,
      rating: profile.averageRating,
      reviewCount: 0, // This would come from actual reviews count
      services: profile.notaryServices.map((ns) => ns.service.name),
      certifications: profile.certifications.map((c) => c.certification.name),
      availableToday: Math.random() > 0.5, // Random for demo purposes
      experience: Math.floor(Math.random() * 10) + 1, // Random for demo purposes
    }));

    return NextResponse.json(notaries);
  } catch (error) {
    console.error("Error fetching notaries:", error);
    return NextResponse.json(
      { error: "Failed to fetch notaries" },
      { status: 500 }
    );
  }
}
```


### 📁 app/api/notaries/profile


#### 📄 route.ts

```typescript
// src/app/api/notary/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import getServerSession from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "NOTARY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = session.user.id;

    // Get notary profile with services and certifications
    const notaryProfile = await prisma.notaryProfile.findUnique({
      where: {
        userId: userId,
      },
      include: {
        notaryServices: true,
        certifications: true,
      },
    });

    if (!notaryProfile) {
      return NextResponse.json(
        { error: "Notary profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(notaryProfile);
  } catch (error) {
    console.error("Error fetching notary profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch notary profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "NOTARY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate inputs
    const { address, city, state, zip, hourlyRate, bio } = body;

    if (!address || !city || !state || !zip) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update notary profile
    const updatedProfile = await prisma.notaryProfile.update({
      where: {
        userId: userId,
      },
      data: {
        address,
        city,
        state,
        zip,
        hourlyRate: parseFloat(hourlyRate),
        bio,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error updating notary profile:", error);
    return NextResponse.json(
      { error: "Failed to update notary profile" },
      { status: 500 }
    );
  }
}
```


### 📁 app/api/notaries/services


### 📁 app/api/notaries/services/[id]


#### 📄 route.ts

```typescript
// src/app/api/notary/services/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import getServerSession from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "NOTARY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = session.user.id;
    const serviceId = params.id;

    // Find the notary profile
    const notaryProfile = await prisma.notaryProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!notaryProfile) {
      return NextResponse.json(
        { error: "Notary profile not found" },
        { status: 404 }
      );
    }

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Check if notary already has this service
    const existingService = await prisma.notaryService.findUnique({
      where: {
        notaryProfileId_serviceId: {
          notaryProfileId: notaryProfile.id,
          serviceId: serviceId,
        },
      },
    });

    if (existingService) {
      return NextResponse.json(
        { error: "Service already added" },
        { status: 400 }
      );
    }

    // Add service to notary profile
    const notaryService = await prisma.notaryService.create({
      data: {
        notaryProfileId: notaryProfile.id,
        serviceId: serviceId,
      },
    });

    return NextResponse.json(notaryService);
  } catch (error) {
    console.error("Error adding service to notary:", error);
    return NextResponse.json(
      { error: "Failed to add service" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "NOTARY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = session.user.id;
    const serviceId = params.id;

    // Find the notary profile
    const notaryProfile = await prisma.notaryProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!notaryProfile) {
      return NextResponse.json(
        { error: "Notary profile not found" },
        { status: 404 }
      );
    }

    // Delete the service from notary
    await prisma.notaryService.delete({
      where: {
        notaryProfileId_serviceId: {
          notaryProfileId: notaryProfile.id,
          serviceId: serviceId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing service from notary:", error);
    return NextResponse.json(
      { error: "Failed to remove service" },
      { status: 500 }
    );
  }
}
```


### 📁 app/api/certifications


#### 📄 route.ts

```typescript
// src/app/api/certifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import getServerSession from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const certifications = await prisma.certification.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(certifications);
  } catch (error) {
    console.error("Error fetching certifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch certifications" },
      { status: 500 }
    );
  }
}
```


### 📁 app/api/services


#### 📄 route.ts

```typescript
// src/app/api/services/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
```


### 📁 providers


#### 📄 auth-provider.tsx

```typescript
"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```


### 📁 components


### 📁 components/ui


#### 📄 avatar.tsx

```typescript
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
```


#### 📄 badge.tsx

```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
```


#### 📄 button.tsx

```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```


#### 📄 calendar.tsx

```typescript
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}

export { Calendar }
```


#### 📄 card.tsx

```typescript
import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 px-6", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6", className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```


#### 📄 checkbox.tsx

```typescript
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
```


#### 📄 dialog.tsx

```typescript
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
```


#### 📄 dropdown-menu.tsx

```typescript
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/40 data-[variant=destructive]:focus:text-destructive-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
```


#### 📄 input.tsx

```typescript
import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
```


#### 📄 label.tsx

```typescript
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
```


#### 📄 popover.tsx

```typescript
"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
```


#### 📄 scroll-area.tsx

```typescript
"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
```


#### 📄 select.tsx

```typescript
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-sm font-medium", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
```


#### 📄 slider.tsx

```typescript
"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
```


#### 📄 sonner.tsx

```typescript
"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
```


#### 📄 tabs.tsx

```typescript
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-1",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
```


#### 📄 textarea.tsx

```typescript
import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
```


#### 📄 use-toast.tsx

```typescript
// src/components/ui/use-toast.tsx
"use client";

import { createContext, useContext, useState } from "react";
import { X } from "lucide-react";

type ToastProps = {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};

type ToastContextType = {
  toast: (props: ToastProps) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);
  const [counter, setCounter] = useState(0);

  const toast = (props: ToastProps) => {
    const id = counter;
    setCounter((prev) => prev + 1);
    setToasts((prev) => [...prev, { ...props, id }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 max-w-md">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-lg shadow-lg bg-white border-l-4 ${
              t.variant === "destructive" ? "border-red-500" : "border-primary"
            } animate-enter`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{t.title}</h4>
                {t.description && (
                  <p className="text-sm text-gray-500">{t.description}</p>
                )}
              </div>
              <button onClick={() => dismissToast(t.id)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
```


### 📁 components/home


#### 📄 cta-section.tsx

```typescript
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
            <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join thousands of satisfied customers who use NotaryNow for their notary needs
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Link href="/notaries">
              <Button size="lg" variant="secondary" className="px-8">Find a Notary</Button>
            </Link>
            <Link href="/notaries/join">
              <Button size="lg" variant="outline" className="bg-transparent border-white hover:bg-white/10 px-8">Become a Notary</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```


#### 📄 features-section.tsx

```typescript
import { Card, CardContent } from '@/components/ui/card';
import { Search, Calendar, CheckCircle } from 'lucide-react';

export function FeaturesSection() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">How NotaryNow Works</h2>
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
```


#### 📄 hero-section.tsx

```typescript
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
              <Link href="/notaries/join">
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
                      <span>Find notaries near: New York, NY</span>
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
```


#### 📄 testimonials-section.tsx

```typescript
import { Card, CardContent } from '@/components/ui/card';
import { Star, Users } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      text: "NotaryNow made getting my documents notarized so easy. I found a professional notary within minutes and had my appointment the same day!",
      name: "Sarah Thompson",
      location: "New York, NY"
    },
    {
      text: "As a notary, this platform has helped me grow my business significantly. The scheduling system is intuitive and clients love the convenience.",
      name: "Michael Chen",
      location: "San Francisco, CA"
    },
    {
      text: "I needed urgent notarization for a real estate closing. NotaryNow connected me with a qualified notary who accommodated my tight schedule.",
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
```


### 📁 components/notary


#### 📄 booking-form.tsx

```typescript
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
```


#### 📄 notary-card.tsx

```typescript
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
```


#### 📄 notary-filter.tsx

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Search, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

export function NotaryFilter({ onFilterChange }) {
  const [zipCode, setZipCode] = useState('');
  const [selectedService, setSelectedService] = useState('All Services');
  const [maxDistance, setMaxDistance] = useState([5]);
  const [maxRate, setMaxRate] = useState([100]);
  const [showFilters, setShowFilters] = useState(false);

  const services = [
    "All Services",
    "Deed Notarization",
    "Power of Attorney",
    "Mortgage Signing",
    "Affidavit",
    "Will & Trust",
    "Certified Copies"
  ];

  const handleSearch = () => {
    onFilterChange({
      zipCode,
      service: selectedService,
      maxDistance: maxDistance[0],
      maxRate: maxRate[0]
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="zip">ZIP Code or City</Label>
          <div className="mt-1 relative">
            <Input 
              id="zip" 
              placeholder="Enter ZIP Code or City"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="service">Service Needed</Label>
          <Select 
            value={selectedService} 
            onValueChange={setSelectedService}
          >
            <SelectTrigger id="service">
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service} value={service}>
                  {service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end">
          <Button className="w-full" onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Search Notaries
          </Button>
        </div>
      </div>
      
      <div className="mt-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm flex items-center"
        >
          <Filter className="mr-1 h-3 w-3" />
          Filters
          {showFilters ? 
            <ChevronUp className="ml-1 h-3 w-3" /> : 
            <ChevronDown className="ml-1 h-3 w-3" />
          }
        </Button>
        
        {showFilters && (
          <div className="grid gap-6 md:grid-cols-2 mt-4 pt-4 border-t">
            <div>
              <div className="flex justify-between mb-2">
                <Label>Maximum Distance</Label>
                <span className="text-sm">{maxDistance[0]} miles</span>
              </div>
              <Slider 
                value={maxDistance} 
                onValueChange={setMaxDistance} 
                max={20}
                step={0.5}
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <Label>Maximum Hourly Rate</Label>
                <span className="text-sm">${maxRate[0]}</span>
              </div>
              <Slider 
                value={maxRate} 
                onValueChange={setMaxRate} 
                max={200}
                step={5}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```


### 📁 components/layout


#### 📄 footer.tsx

```typescript
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
              <span className="text-xl font-bold text-white">NotaryNow</span>
            </div>
            <p className="text-sm text-gray-400">Professional notary services at your fingertips.</p>
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
              <li><Link href="/notaries/join" className="hover:text-white transition-colors">Join Our Network</Link></li>
              <li><Link href="/notaries/requirements" className="hover:text-white transition-colors">Requirements</Link></li>
              <li><Link href="/notaries/resources" className="hover:text-white transition-colors">Resources</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>support@notarynow.com</li>
              <li>1-800-NOTARY</li>
              <li>123 Business Ave, Suite 100</li>
              <li>New York, NY 10001</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} NotaryNow. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```


#### 📄 header.tsx

```typescript
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
          <Link href="/" className="text-xl font-bold">NotaryNow</Link>
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
```


#### 📄 sidebar.tsx

```typescript
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Briefcase, FileCheck, Settings, BarChart3 } from 'lucide-react';

type SidebarProps = {
  userRole: 'admin' | 'notary' | 'customer' | 'secretary';
  userName: string;
  userEmail: string;
  pendingCount?: number;
};

export function Sidebar({ userRole, userName, userEmail, pendingCount = 0 }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('dashboard');
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };
  
  return (
    <div className="hidden md:flex w-64 flex-col fixed inset-y-0 border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">NotaryNow</span>
        </div>
      </div>
      <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
        <div className="px-4 mb-5">
          <Badge className="w-full justify-center py-1" variant="outline">
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </Badge>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          <Button 
            variant={activeItem === "dashboard" ? "default" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setActiveItem("dashboard")}
            asChild
          >
            <Link href={`/dashboard/${userRole}`}>
              <BarChart3 className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
          </Button>
          
          {(userRole === 'admin' || userRole === 'secretary') && (
            <Button 
              variant={activeItem === "notaries" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveItem("notaries")}
              asChild
            >
              <Link href={`/dashboard/${userRole}/notaries`}>
                <Briefcase className="mr-3 h-5 w-5" />
                Notaries
                {pendingCount > 0 && (
                  <Badge className="ml-auto">{pendingCount}</Badge>
                )}
              </Link>
            </Button>
          )}
          
          {(userRole === 'admin' || userRole === 'secretary') && (
            <Button 
              variant={activeItem === "customers" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveItem("customers")}
              asChild
            >
              <Link href={`/dashboard/${userRole}/customers`}>
                <Users className="mr-3 h-5 w-5" />
                Customers
              </Link>
            </Button>
          )}
          
          <Button 
            variant={activeItem === "appointments" ? "default" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setActiveItem("appointments")}
            asChild
          >
            <Link href={`/dashboard/${userRole}/appointments`}>
              <Calendar className="mr-3 h-5 w-5" />
              Appointments
            </Link>
          </Button>
          
          {(userRole === 'admin' || userRole === 'notary') && (
            <Button 
              variant={activeItem === "reports" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveItem("reports")}
              asChild
            >
              <Link href={`/dashboard/${userRole}/reports`}>
                <FileCheck className="mr-3 h-5 w-5" />
                Reports
              </Link>
            </Button>
          )}
          
          <Button 
            variant={activeItem === "settings" ? "default" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setActiveItem("settings")}
            asChild
          >
            <Link href={`/dashboard/${userRole}/settings`}>
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Link>
          </Button>
        </nav>
      </div>
      <div className="flex items-center border-t p-4">
        <div className="flex-shrink-0">
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback>{getInitials(userName)}</AvatarFallback>
          </Avatar>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-xs text-gray-500">{userEmail}</p>
        </div>
      </div>
    </div>
  );
}
```


### 📁 components/dashboard


#### 📄 appointment-card.tsx

```typescript
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    status: 'pending' | 'approved' | 'denied' | 'completed' | 'cancelled';
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
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'denied': 
      case 'cancelled': 
        return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
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
            <span>Total Cost: ${appointment.cost}</span>
          </div>
          {appointment.rated && (
            <div className="flex items-center text-sm">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < appointment.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button variant="outline" size="sm">View Details</Button>
        
        {appointment.status === 'pending' && onCancel && (
          <Button variant="destructive" size="sm" onClick={() => onCancel(appointment.id)}>
            Cancel Request
          </Button>
        )}
        
        {appointment.status === 'approved' && onReschedule && (
          <Button variant="outline" size="sm" onClick={() => onReschedule(appointment.id)}>
            Reschedule
          </Button>
        )}
        
        {appointment.status === 'completed' && !appointment.rated && onReview && (
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
                  <textarea
                    id="comment"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-24 p-2"
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
```


#### 📄 quick-actions.tsx

```typescript
import { Button } from '@/components/ui/button';
import { Search, Plus, FileText } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/notaries">
          <Button className="h-auto py-6 w-full flex flex-col items-center justify-center gap-2">
            <Search className="h-6 w-6" />
            <span>Find a Notary</span>
          </Button>
        </Link>
        <Link href="/appointments/schedule">
          <Button variant="outline" className="h-auto py-6 w-full flex flex-col items-center justify-center gap-2">
            <Plus className="h-6 w-6" />
            <span>Schedule Appointment</span>
          </Button>
        </Link>
        <Link href="/documents">
          <Button variant="outline" className="h-auto py-6 w-full flex flex-col items-center justify-center gap-2">
            <FileText className="h-6 w-6" />
            <span>Upload Documents</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
```


#### 📄 stats-card.tsx

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export function StatsCard({ title, value, description, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className={`pb-2 ${Icon ? 'flex flex-row items-center justify-between space-y-0' : ''}`}>
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
        {trend && (
          <p className={`text-xs ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? '+' : ''}{trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```


### 📁 lib


#### 📄 db.ts

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```


#### 📄 utils.ts

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```
