import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import getServerSession from "next-auth";
import { authOptions } from "@/app/api/auth/auth-options";
import { z } from "zod";

// Validation schema for query parameters
const notarySearchSchema = z.object({
  zipCode: z.string().max(50, "Location name too long").optional(), // Changed for Rwanda sectors
  service: z.string().max(100, "Service name too long").optional(),
  maxDistance: z.string().regex(/^\d+(\.\d+)?$/, "Invalid distance format").optional(),
  maxRate: z.string().regex(/^\d+(\.\d+)?$/, "Invalid rate format").optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      zipCode: searchParams.get("zipCode"),
      service: searchParams.get("service"),
      maxDistance: searchParams.get("maxDistance"),
      maxRate: searchParams.get("maxRate"),
    };
    
    // Filter out null values
    const filteredParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, v]) => v !== null)
    );
    
    const validatedQuery = notarySearchSchema.safeParse(filteredParams);
    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validatedQuery.error.issues },
        { status: 400 }
      );
    }
    
    const { zipCode, service, maxDistance, maxRate } = validatedQuery.data;

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