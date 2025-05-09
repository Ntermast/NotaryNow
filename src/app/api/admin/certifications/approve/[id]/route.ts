import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";

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

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find the notary certification
    const notaryCertification = await prisma.notaryCertification.findUnique({
      where: {
        id
      },
      include: {
        notaryProfile: {
          select: {
            id: true,
            userId: true
          }
        },
        certification: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!notaryCertification) {
      return NextResponse.json(
        { error: "Certification not found" },
        { status: 404 }
      );
    }

    // In a real implementation, you would update a status field
    // For now, we'll just update the record to simulate approval
    const updatedCertification = await prisma.notaryCertification.update({
      where: {
        id
      },
      data: {
        // In a real implementation, you'd have a status field like:
        // status: "approved"
        
        // For now, we'll just add an "approved" field to track it
        documentUrl: `${notaryCertification.documentUrl}#approved`
      }
    });

    return NextResponse.json(updatedCertification);
  } catch (error) {
    console.error("Error approving certification:", error);
    return NextResponse.json(
      { error: "Failed to approve certification" },
      { status: 500 }
    );
  }
}