import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Get a single certification
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const certificationId = params.id;
    
    const certification = await prisma.certification.findUnique({
      where: {
        id: certificationId
      },
      include: {
        _count: {
          select: {
            notaries: true
          }
        }
      }
    });

    if (!certification) {
      return NextResponse.json(
        { error: "Certification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(certification);
  } catch (error) {
    console.error("Error fetching certification:", error);
    return NextResponse.json(
      { error: "Failed to fetch certification" },
      { status: 500 }
    );
  }
}

// Update a certification
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

    const certificationId = params.id;
    const body = await request.json();
    const { name, description } = body;

    // Validate that at least name is provided
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Check if certification exists
    const existingCertification = await prisma.certification.findUnique({
      where: {
        id: certificationId
      }
    });

    if (!existingCertification) {
      return NextResponse.json(
        { error: "Certification not found" },
        { status: 404 }
      );
    }

    // Update the certification
    const updatedCertification = await prisma.certification.update({
      where: {
        id: certificationId
      },
      data: {
        name,
        description
      },
      include: {
        _count: {
          select: {
            notaries: true
          }
        }
      }
    });

    return NextResponse.json(updatedCertification);
  } catch (error) {
    console.error("Error updating certification:", error);
    
    // Check for unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A certification with this name already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update certification" },
      { status: 500 }
    );
  }
}

// Delete a certification
export async function DELETE(
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

    const certificationId = params.id;

    // Check if certification exists
    const existingCertification = await prisma.certification.findUnique({
      where: {
        id: certificationId
      },
      include: {
        _count: {
          select: {
            notaries: true
          }
        }
      }
    });

    if (!existingCertification) {
      return NextResponse.json(
        { error: "Certification not found" },
        { status: 404 }
      );
    }

    // Check if certification is in use
    if (existingCertification._count.notaries > 0) {
      return NextResponse.json(
        { error: "Cannot delete certification that is in use by notaries" },
        { status: 400 }
      );
    }

    // Delete the certification
    await prisma.certification.delete({
      where: {
        id: certificationId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting certification:", error);
    return NextResponse.json(
      { error: "Failed to delete certification" },
      { status: 500 }
    );
  }
}