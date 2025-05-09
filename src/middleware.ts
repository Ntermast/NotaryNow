// src/middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;
  
  // Skip middleware for non-dashboard routes and static files
  if (!path.startsWith('/dashboard') || 
      path.includes('/_next') || 
      path.includes('/api') ||
      path.includes('/favicon.ico')) {
    return NextResponse.next();
  }

  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If not authenticated
  if (!token) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(url);
  }

  // If trying to access a role-specific dashboard
  if (path.startsWith('/dashboard/')) {
    const userRole = token.role as string;
    const requestedRole = path.split('/')[2]; // dashboard/[role]
    
    // Normalize roles for comparison
    const normalizedUserRole = userRole.toLowerCase();
    const normalizedRequestedRole = requestedRole.toLowerCase();
    
    // Check if user has the correct role
    if (normalizedRequestedRole !== normalizedUserRole && 
        // Check if the path goes beyond role (e.g., /dashboard/notary/settings)
        path.split('/').length > 3) {
      const correctPath = `/dashboard/${normalizedUserRole}`;
      return NextResponse.redirect(new URL(correctPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};