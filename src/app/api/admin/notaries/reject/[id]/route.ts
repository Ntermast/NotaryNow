import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";
import { NotificationService } from "@/lib/notifications";
import { z } from "zod";

const rejectSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Please provide a short explanation (min 5 characters).")
    .max(500, "Reason is too long.")
    .optional(),
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
    const validation = rejectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const notaryProfile = await prisma.notaryProfile.findFirst({
      where: {
        user: {
          id,
          role: "NOTARY",
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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

    const updatedProfile = await prisma.notaryProfile.update({
      where: {
        id: notaryProfile.id,
      },
      data: {
        isApproved: false,
        approvalStatus: "REJECTED",
        rejectionReason: validation.data.reason ?? null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    try {
      await NotificationService.notifyNotaryApplicationStatus(
        updatedProfile.user.id,
        "REJECTED",
        { reason: validation.data.reason }
      );
    } catch (notificationError) {
      console.error("Error sending rejection notification:", notificationError);
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error rejecting notary:", error);
    return NextResponse.json(
      { error: "Failed to reject notary" },
      { status: 500 }
    );
  }
}
