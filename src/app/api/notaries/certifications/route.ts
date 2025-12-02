// src/app/api/notaries/certifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";
import { z } from "zod";
import { NotificationService } from "@/lib/notifications";

// Validation schema
const addCertificationSchema = z.object({
  certificationId: z.string().cuid("Invalid certification ID"),
  dateObtained: z.string().min(1, "Date is required"),
  documentUrl: z.string().url("Invalid URL format").optional(),
});

// Add a new certification to the notary's profile
export async function POST(request: NextRequest) {
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
    const validatedData = addCertificationSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.issues },
        { status: 400 }
      );
    }

    const { certificationId, dateObtained, documentUrl } = validatedData.data;

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
        id: certificationId,
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
          certificationId: certificationId,
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
        certificationId: certificationId,
        dateObtained: new Date(dateObtained),
        documentUrl: documentUrl || null,
        status: "PENDING",
      },
      include: {
        certification: true,
      },
    });

    // Notify admins about the new certification submission
    try {
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
            actionUrl: "/dashboard/admin/certifications",
            metadata: {
              type: "certification",
              certificationId: notaryCertification.id,
              notaryId: notaryProfile.userId,
            },
          }
        );
      }
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
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
