// src/app/api/notary/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";
import { z } from "zod";

// Validation schema
const updateNotaryProfileSchema = z.object({
  address: z.string().min(1, "Address is required").max(200, "Address too long"),
  city: z.string().min(1, "City is required").max(100, "City name too long"),
  state: z.string().min(2, "Province/State is required").max(50, "Province name too long"),
  zip: z.string().min(1, "Postal code is required").max(20, "Postal code too long"),
  hourlyRate: z.number().min(0, "Rate must be positive").max(1000000, "Rate too high"),
  bio: z.string().max(1000, "Bio too long").optional(),
});

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

    // Validate request body
    const validatedData = updateNotaryProfileSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.issues },
        { status: 400 }
      );
    }

    const { address, city, state, zip, hourlyRate, bio } = validatedData.data;

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
        hourlyRate,
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