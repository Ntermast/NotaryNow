import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all pending notary service requests
    const pendingServices = await prisma.notaryService.findMany({
      where: {
        status: "PENDING"
      },
      include: {
        notaryProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        service: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the response
    const formattedPending = pendingServices.map(ns => ({
      id: ns.id,
      serviceId: ns.serviceId,
      serviceName: ns.service.name,
      serviceDescription: ns.service.description,
      basePrice: ns.service.basePrice,
      customPrice: ns.customPrice,
      notaryId: ns.notaryProfile.user.id,
      notaryName: ns.notaryProfile.user.name,
      notaryEmail: ns.notaryProfile.user.email,
      status: ns.status,
      createdAt: ns.createdAt
    }));

    return NextResponse.json(formattedPending);
  } catch (error) {
    console.error("Error fetching pending services:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending services" },
      { status: 500 }
    );
  }
}
