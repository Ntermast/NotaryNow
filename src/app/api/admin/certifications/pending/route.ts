import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth/[...nextauth]/route";

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

    // Get all notary certifications pending approval
    // In a real implementation, you would have a status field on NotaryCertification
    // For now, we'll use the documentUrl presence to determine if it needs review
    const pendingCertifications = await prisma.notaryCertification.findMany({
      where: {
        documentUrl: {
          not: null
        }
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
        certification: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the response
    const formattedPending = pendingCertifications.map(cert => ({
      id: cert.id,
      notaryId: cert.notaryProfile.user.id,
      notaryName: cert.notaryProfile.user.name,
      notaryEmail: cert.notaryProfile.user.email,
      certificationId: cert.certification.id,
      certificationName: cert.certification.name,
      dateObtained: cert.dateObtained,
      documentUrl: cert.documentUrl,
      status: "pending", // In real app, this would come from the database
      createdAt: cert.createdAt
    }));

    return NextResponse.json(formattedPending);
  } catch (error) {
    console.error("Error fetching pending certifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending certifications" },
      { status: 500 }
    );
  }
}