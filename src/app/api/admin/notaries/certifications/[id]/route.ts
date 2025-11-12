import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { NotificationService } from "@/lib/notifications";

const decisionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = decisionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const notaryCertification = await prisma.notaryCertification.findUnique({
      where: { id },
      include: {
        notaryProfile: {
          include: {
            user: true,
          },
        },
        certification: true,
      },
    });

    if (!notaryCertification) {
      return NextResponse.json(
        { error: "Certification submission not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.notaryCertification.update({
      where: { id },
      data: {
        status: validation.data.status,
      },
      include: {
        certification: true,
      },
    });

    if (validation.data.status === "APPROVED") {
      await NotificationService.notifyCertificationApproved(
        notaryCertification.notaryProfile.userId,
        notaryCertification.certification.name
      );
    } else {
      await NotificationService.create({
        userId: notaryCertification.notaryProfile.userId,
        type: "SYSTEM_ALERT",
        title: "Certification Update",
        message: `Your ${notaryCertification.certification.name} certification was declined by the administrator.`,
        actionUrl: "/dashboard/notary/settings?tab=certifications",
        metadata: { type: "certification", status: "REJECTED" },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating certification:", error);
    return NextResponse.json(
      { error: "Failed to update certification" },
      { status: 500 }
    );
  }
}

