// src/app/api/notaries/certifications/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";
import { z } from "zod";
import { NotificationService } from "@/lib/notifications";

// Validation schemas
const addCertificationSchema = z.object({
  dateObtained: z.string().optional(),
  documentUrl: z.string().optional(),
});

const updateCertificationSchema = z.object({
  certificationId: z.string().optional(),
  dateObtained: z.string().optional(),
  documentUrl: z.string().optional(),
});

// Add a certification to a notary profile
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
    const body = await request.json();

    // Validate request body
    const validatedData = addCertificationSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.issues },
        { status: 400 }
      );
    }

    const { dateObtained, documentUrl } = validatedData.data;

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

    // Check if certification exists
    const certification = await prisma.certification.findUnique({
      where: {
        id,
      },
    });

    if (!certification) {
      return NextResponse.json(
        { error: "Certification not found" },
        { status: 404 }
      );
    }

    // Check if notary already has this certification
    const existingCertification = await prisma.notaryCertification.findUnique({
      where: {
        notaryProfileId_certificationId: {
          notaryProfileId: notaryProfile.id,
          certificationId: id,
        },
      },
    });

    if (existingCertification) {
      return NextResponse.json(
        { error: "Certification already added" },
        { status: 400 }
      );
    }

    // Add certification to notary profile
    const notaryCertification = await prisma.notaryCertification.create({
      data: {
        notaryProfileId: notaryProfile.id,
        certificationId: id,
        dateObtained: dateObtained ? new Date(dateObtained) : null,
        documentUrl,
      },
      include: {
        certification: true,
      },
    });

    // Notify admins about the new certification submission
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (admins.length > 0) {
      await NotificationService.createForMultipleUsers(
        admins.map((admin) => admin.id),
        {
          type: "SYSTEM_ALERT",
          title: "New Certification Submitted",
          message: `${session.user.name || "A notary"} uploaded ${certification.name} for review.`,
          actionUrl: "/dashboard/admin/notaries",
          metadata: {
            type: "certification",
            certificationId: notaryCertification.id,
            notaryId: notaryProfile.userId,
          },
        }
      );
    }

    return NextResponse.json(notaryCertification);
  } catch (error) {
    console.error("Error adding certification to notary:", error);
    return NextResponse.json(
      { error: "Failed to add certification" },
      { status: 500 }
    );
  }
}

// Remove a certification from a notary profile
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

    // Delete the certification from notary
    await prisma.notaryCertification.delete({
      where: {
        notaryProfileId_certificationId: {
          notaryProfileId: notaryProfile.id,
          certificationId: id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing certification from notary:", error);
    return NextResponse.json(
      { error: "Failed to remove certification" },
      { status: 500 }
    );
  }
}

// Update certification details (date obtained, document URL)
export async function PATCH(
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
    const body = await request.json();

    // Validate request body
    const validatedData = updateCertificationSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.issues },
        { status: 400 }
      );
    }

    const { dateObtained, documentUrl } = validatedData.data;

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

    // Find the existing notary certification by ID
    const existingCert = await prisma.notaryCertification.findFirst({
      where: {
        id: id,
        notaryProfileId: notaryProfile.id,
      },
    });

    if (!existingCert) {
      return NextResponse.json(
        { error: "Certification not found in your profile" },
        { status: 404 }
      );
    }

    // Update the certification
    const updatedCertification = await prisma.notaryCertification.update({
      where: {
        id: id,
      },
      data: {
        dateObtained: dateObtained ? new Date(dateObtained) : undefined,
        documentUrl: documentUrl || undefined,
        status: "PENDING", // Reset to pending when updated
      },
      include: {
        certification: true,
      },
    });

    return NextResponse.json(updatedCertification);
  } catch (error) {
    console.error("Error updating notary certification:", error);
    return NextResponse.json(
      { error: "Failed to update certification" },
      { status: 500 }
    );
  }
}
