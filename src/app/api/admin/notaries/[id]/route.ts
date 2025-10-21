import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get detailed notary information
    const notary = await prisma.user.findUnique({
      where: {
        id,
        role: "NOTARY",
      },
      include: {
        notaryProfile: {
          include: {
            certifications: {
              include: {
                certification: true
              }
            },
            notaryServices: {
              include: {
                service: true
              }
            }
          }
        }
      },
    });

    if (!notary) {
      return NextResponse.json(
        { error: "Notary not found" },
        { status: 404 }
      );
    }

    // Transform the data for the frontend
    const detailedNotary = {
      id: notary.id,
      name: notary.name,
      email: notary.email,
      phone: notary.phone,
      createdAt: notary.createdAt,
      isApproved: notary.notaryProfile?.isApproved || false,
      approvalStatus: notary.notaryProfile?.approvalStatus || "PENDING",
      rejectionReason: notary.notaryProfile?.rejectionReason || null,
      
      // Profile information
      address: notary.notaryProfile?.address,
      city: notary.notaryProfile?.city,
      state: notary.notaryProfile?.state,
      zip: notary.notaryProfile?.zip,
      bio: notary.notaryProfile?.bio,
      hourlyRate: notary.notaryProfile?.hourlyRate,
      
      // Services
      services: notary.notaryProfile?.notaryServices?.map(ns => ns.service.name) || [],
      
      // Certifications with approval status
      certifications: notary.notaryProfile?.certifications?.map(cert => ({
        id: cert.id,
        name: cert.certification.name,
        dateObtained: cert.dateObtained,
        documentUrl: cert.documentUrl,
        isApproved: cert.status === 'APPROVED'
      })) || []
    };

    return NextResponse.json(detailedNotary);
  } catch (error) {
    console.error("Error fetching notary details:", error);
    return NextResponse.json(
      { error: "Failed to fetch notary details" },
      { status: 500 }
    );
  }
}
