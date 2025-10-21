// src/app/api/notary/services/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";
import { z } from "zod";

const priceSchema = z.object({
  customPrice: z
    .number({ invalid_type_error: "Custom price must be a number" })
    .min(0, "Custom price must be greater than or equal to 0")
    .max(10_000_000, "Custom price is unrealistically high")
    .optional(),
});

async function getNotaryProfile(userId: string) {
  return prisma.notaryProfile.findUnique({
    where: {
      userId,
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "NOTARY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: serviceId } = await params;
    const userId = session.user.id;
    const body = request.body ? await request.json().catch(() => ({})) : {};
    const validation = priceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const notaryProfile = await getNotaryProfile(userId);

    if (!notaryProfile) {
      return NextResponse.json(
        { error: "Notary profile not found" },
        { status: 404 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    const existingService = await prisma.notaryService.findUnique({
      where: {
        notaryProfileId_serviceId: {
          notaryProfileId: notaryProfile.id,
          serviceId,
        },
      },
    });

    if (existingService) {
      return NextResponse.json(
        { error: "Service already added" },
        { status: 400 }
      );
    }

    const notaryService = await prisma.notaryService.create({
      data: {
        notaryProfileId: notaryProfile.id,
        serviceId,
        customPrice: validation.data.customPrice ?? null,
      },
      include: {
        service: true,
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "NOTARY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: serviceId } = await params;
    const userId = session.user.id;
    const body = await request.json();
    const validation = priceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const notaryProfile = await getNotaryProfile(userId);

    if (!notaryProfile) {
      return NextResponse.json(
        { error: "Notary profile not found" },
        { status: 404 }
      );
    }

    const existingService = await prisma.notaryService.findUnique({
      where: {
        notaryProfileId_serviceId: {
          notaryProfileId: notaryProfile.id,
          serviceId,
        },
      },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Service not found in your offerings" },
        { status: 404 }
      );
    }

    const updatedService = await prisma.notaryService.update({
      where: {
        notaryProfileId_serviceId: {
          notaryProfileId: notaryProfile.id,
          serviceId,
        },
      },
      data: {
        customPrice:
          validation.data.customPrice !== undefined
            ? validation.data.customPrice
            : null,
      },
      include: {
        service: true,
      },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Error updating notary service price:", error);
    return NextResponse.json(
      { error: "Failed to update service price" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "NOTARY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: serviceId } = await params;
    const userId = session.user.id;

    const notaryProfile = await getNotaryProfile(userId);

    if (!notaryProfile) {
      return NextResponse.json(
        { error: "Notary profile not found" },
        { status: 404 }
      );
    }

    await prisma.notaryService.delete({
      where: {
        notaryProfileId_serviceId: {
          notaryProfileId: notaryProfile.id,
          serviceId,
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
