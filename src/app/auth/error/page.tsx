// src/app/auth/error/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function AuthError() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams?.get("error");
    if (errorParam) {
      switch (errorParam) {
        case "CredentialsSignin":
          setError("Invalid email or password");
          break;
        case "SessionRequired":
          setError("Please sign in to access this page");
          break;
        default:
          setError("An error occurred during authentication");
      }
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Authentication Error</CardTitle>
            <CardDescription className="text-center">
              {error || "An error occurred during the authentication process"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-500">
              Please try again or contact support if the problem persists.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/auth/signin">
              <Button>Return to Sign In</Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}