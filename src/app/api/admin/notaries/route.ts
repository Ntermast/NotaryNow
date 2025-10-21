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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter"); // 'all', 'pending', 'approved', 'rejected'

    // Build where clause
    const where: any = {
      user: {
        role: "NOTARY",
      },
    };

    if (filter === "pending") {
      where.approvalStatus = "PENDING";
    } else if (filter === "approved") {
      where.approvalStatus = "APPROVED";
    } else if (filter === "rejected") {
      where.approvalStatus = "REJECTED";
    }

    // Get all notary profiles
    const notaryProfiles = await prisma.notaryProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          }
        },
        notaryServices: {
          include: {
            service: true
          }
        },
        certifications: {
          include: {
            certification: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the response
    const notaries = notaryProfiles.map((profile) => ({
      id: profile.user.id,
      name: profile.user.name,
      email: profile.user.email,
      isApproved: profile.isApproved,
      approvalStatus: profile.approvalStatus,
      rejectionReason: profile.rejectionReason,
      location: `${profile.city}, ${profile.state}`,
      address: profile.address,
      zip: profile.zip,
      hourlyRate: profile.hourlyRate,
      bio: profile.bio,
      createdAt: profile.user.createdAt,
      services: profile.notaryServices.map(ns => ({
        id: ns.service.id,
        name: ns.service.name,
        customPrice: ns.customPrice
      })),
      certifications: profile.certifications.map(c => ({
        id: c.certification.id,
        name: c.certification.name,
        dateObtained: c.dateObtained
      }))
    }));

    return NextResponse.json(notaries);
  } catch (error) {
    console.error("Error fetching notaries:", error);
    return NextResponse.json(
      { error: "Failed to fetch notaries" },
      { status: 500 }
    );
  }
}
