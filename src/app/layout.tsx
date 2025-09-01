import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/providers/auth-provider";
import { ToastProvider } from "@/components/ui/use-toast";
import { SessionInfo } from "@/components/debug/session-info";
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
  title: "NotaryAvailability - Professional Notary Services in Rwanda",
  description: "Find and book professional notary services across Kigali and Rwanda. Quick, convenient, and secure notarization at your fingertips.",
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
          <ToastProvider>
            {children}
            {process.env.NODE_ENV === "development" && <SessionInfo />}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
