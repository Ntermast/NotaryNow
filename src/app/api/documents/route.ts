// src/app/api/documents/route.ts
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

    const searchParams = request.nextUrl.searchParams;
    const appointmentId = searchParams.get('appointmentId');

    const whereClause: any = {};

    // Customers can only see their own documents
    if (session.user.role === "CUSTOMER") {
      whereClause.customerId = session.user.id;
    }
    
    // Notaries can see documents for their appointments
    if (session.user.role === "NOTARY") {
      const notaryProfile = await prisma.notaryProfile.findUnique({
        where: { userId: session.user.id }
      });

      if (!notaryProfile) {
        return NextResponse.json({ error: "Notary profile not found" }, { status: 404 });
      }

      if (appointmentId) {
        // Check if this appointment belongs to the notary
        const appointment = await prisma.appointment.findFirst({
          where: {
            id: appointmentId,
            notaryId: session.user.id
          }
        });

        if (!appointment) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        whereClause.appointmentId = appointmentId;
      } else {
        // Get all documents for appointments assigned to this notary
        const appointments = await prisma.appointment.findMany({
          where: { notaryId: session.user.id },
          select: { id: true }
        });
        
        whereClause.appointmentId = {
          in: appointments.map(apt => apt.id)
        };
      }
    }

    // Admins and secretaries can see all documents
    if (session.user.role === "ADMIN" || session.user.role === "SECRETARY") {
      if (appointmentId) {
        whereClause.appointmentId = appointmentId;
      }
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only customers can upload documents (or admins/secretaries on behalf)
    if (session.user.role !== "CUSTOMER" && session.user.role !== "ADMIN" && session.user.role !== "SECRETARY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { fileName, originalName, fileSize, fileType, fileUrl, appointmentId, customerId } = body;

    if (!fileName || !originalName || !fileSize || !fileType || !fileUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Determine the customer ID
    let actualCustomerId = customerId;
    if (session.user.role === "CUSTOMER") {
      actualCustomerId = session.user.id; // Customers can only upload for themselves
    }

    if (!actualCustomerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    // If appointmentId is provided, verify it exists and belongs to the customer
    if (appointmentId) {
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          customerId: actualCustomerId
        }
      });

      if (!appointment) {
        return NextResponse.json(
          { error: "Appointment not found or unauthorized" },
          { status: 404 }
        );
      }
    }

    const document = await prisma.document.create({
      data: {
        customerId: actualCustomerId,
        fileName,
        originalName,
        fileSize,
        fileType,
        fileUrl,
        appointmentId: appointmentId || null
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

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}