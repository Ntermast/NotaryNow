// src/app/api/notary/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";
import { z } from "zod";

// Validation schema
const updateNotaryProfileSchema = z.object({
  address: z.string().max(200, "Address too long").optional(),
  city: z.string().max(100, "City name too long").optional(),
  state: z.string().max(50, "Province name too long").optional(),
  zip: z.string().max(20, "Postal code too long").optional(),
  hourlyRate: z.number().min(0, "Rate must be positive").max(10000000, "Rate too high").optional(),
  bio: z.string().max(1000, "Bio too long").optional().nullable(),
  notaryType: z.enum(["PUBLIC", "PRIVATE"]).optional(),
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

    const { address, city, state, zip, hourlyRate, bio, notaryType } = validatedData.data;

    // Build update data only with provided fields
    const updateData: any = {};
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zip !== undefined) updateData.zip = zip;
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
    if (bio !== undefined) updateData.bio = bio || null;
    if (notaryType !== undefined) updateData.notaryType = notaryType;

    // Update notary profile
    const updatedProfile = await prisma.notaryProfile.update({
      where: {
        userId: userId,
      },
      data: updateData,
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
