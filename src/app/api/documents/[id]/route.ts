// src/app/api/documents/[id]/route.ts
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

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        appointment: {
          select: {
            id: true,
            scheduledTime: true,
            notaryId: true,
            service: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Check access permissions
    let hasAccess = false;

    if (session.user.role === "ADMIN" || session.user.role === "SECRETARY") {
      hasAccess = true;
    } else if (session.user.role === "CUSTOMER") {
      hasAccess = document.customerId === session.user.id;
    } else if (session.user.role === "NOTARY") {
      // Notary can access if the document is for their appointment
      hasAccess = document.appointment?.notaryId === session.user.id;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const document = await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        customerId: true,
        fileUrl: true
      }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Check delete permissions
    let canDelete = false;

    if (session.user.role === "ADMIN" || session.user.role === "SECRETARY") {
      canDelete = true;
    } else if (session.user.role === "CUSTOMER") {
      canDelete = document.customerId === session.user.id;
    }

    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // In a real application, you would also delete the file from storage
    // e.g., delete from S3, local filesystem, etc.

    await prisma.document.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const { originalName, appointmentId } = body;

    const document = await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        customerId: true
      }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Check update permissions
    let canUpdate = false;

    if (session.user.role === "ADMIN" || session.user.role === "SECRETARY") {
      canUpdate = true;
    } else if (session.user.role === "CUSTOMER") {
      canUpdate = document.customerId === session.user.id;
    }

    if (!canUpdate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If appointmentId is being updated, verify it exists and belongs to the customer
    if (appointmentId) {
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          customerId: document.customerId
        }
      });

      if (!appointment) {
        return NextResponse.json(
          { error: "Appointment not found or unauthorized" },
          { status: 404 }
        );
      }
    }

    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        ...(originalName && { originalName }),
        ...(appointmentId !== undefined && { appointmentId: appointmentId || null })
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        appointment: {
          select: {
            id: true,
            scheduledTime: true,
            service: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}