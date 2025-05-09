// src/app/api/notary/services/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "NOTARY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = session.user.id;

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
        id,
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
          serviceId: id,
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
        serviceId: id,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "NOTARY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = session.user.id;

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
          serviceId: id,
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