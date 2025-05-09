// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "../auth-options";

// Create the handler with the auth options
const handler = NextAuth(authOptions);

// Export the handler for the route
export { handler as GET, handler as POST };