import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth/[...nextauth]/route";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const notaryId = params.id;

    // Find the notary profile
    const notaryProfile = await prisma.notaryProfile.findFirst({
      where: {
        user: {
          id: notaryId,
          role: "NOTARY"
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!notaryProfile) {
      return NextResponse.json(
        { error: "Notary profile not found" },
        { status: 404 }
      );
    }

    // Update the approval status
    const updatedProfile = await prisma.notaryProfile.update({
      where: {
        id: notaryProfile.id
      },
      data: {
        isApproved: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error approving notary:", error);
    return NextResponse.json(
      { error: "Failed to approve notary" },
      { status: 500 }
    );
  }
}