import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";
import { NotificationService } from "@/lib/notifications";

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
        status: "APPROVED",
        rejectionReason: null,
        approvedAt: new Date(),
      },
      include: {
        service: true,
      },
    });

    try {
      await NotificationService.create({
        userId: notaryService.notaryProfile.userId,
        type: "SYSTEM_ALERT",
        title: "Service Approved",
        message: `Your request to offer ${notaryService.service.name} has been approved.`,
        actionUrl: "/dashboard/notary/services",
        metadata: { type: "service-approval", serviceId: id },
      });
    } catch (notificationError) {
      console.error("Failed to send service approval notification:", notificationError);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error approving notary service:", error);
    return NextResponse.json(
      { error: "Failed to approve service" },
      { status: 500 }
    );
  }
}

