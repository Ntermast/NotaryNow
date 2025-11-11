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
    .min(5, "Please provide a brief explanation (min 5 characters).")
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
    const payload = await request.json().catch(() => ({}));
    const validation = rejectSchema.safeParse(payload);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const notaryService = await prisma.notaryService.findUnique({
      where: { id },
      include: {
        notaryProfile: {
          select: {
            userId: true,
          },
        },
        service: true,
      },
    });

    if (!notaryService) {
      return NextResponse.json(
        { error: "Notary service request not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.notaryService.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectionReason: validation.data.reason ?? null,
        approvedAt: null,
      },
      include: {
        service: true,
      },
    });

    try {
      await NotificationService.create({
        userId: notaryService.notaryProfile.userId,
        type: "SYSTEM_ALERT",
        title: "Service Request Declined",
        message: `Your request to offer ${notaryService.service.name} was declined${
          validation.data.reason ? `: ${validation.data.reason}` : "."
        }`,
        actionUrl: "/dashboard/notary/services",
        metadata: {
          type: "service-approval",
          status: "REJECTED",
          serviceId: id,
        },
      });
    } catch (notificationError) {
      console.error("Failed to send service rejection notification:", notificationError);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error rejecting notary service:", error);
    return NextResponse.json(
      { error: "Failed to reject service" },
      { status: 500 }
    );
  }
}

