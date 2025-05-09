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