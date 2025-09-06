import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";
import { NotificationService } from "@/lib/notifications";
import { z } from "zod";

// Validation schemas
const appointmentQuerySchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "all"]).optional(),
});

const createAppointmentSchema = z.object({
  notaryId: z.string().cuid("Invalid notary ID"),
  serviceId: z.string().cuid("Invalid service ID"),
  scheduledTime: z.string().datetime("Invalid date format"),
  duration: z.number().int().min(15).max(480).optional(), // 15 min to 8 hours
  notes: z.string().max(1000, "Notes too long").optional(),
});

export async function GET(request: NextRequest) {
  try {
    console.log("=== APPOINTMENTS API GET REQUEST ===");
    const session = await getServerSession(authOptions);
    console.log("Session:", session?.user);
    
    if (!session) {
      console.log("No session, returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;
    console.log("User ID:", userId, "Role:", userRole);

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get("status");
    const queryParams = {
      status: statusParam === null ? undefined : statusParam,
    };
    console.log("Query params:", queryParams);
    
    const validatedQuery = appointmentQuerySchema.safeParse(queryParams);
    console.log("Query validation result:", validatedQuery);
    
    if (!validatedQuery.success) {
      console.error("Query validation failed:", validatedQuery.error);
      return NextResponse.json(
        { error: "Invalid query parameters", details: validatedQuery.error.issues },
        { status: 400 }
      );
    }
    
    const { status } = validatedQuery.data;

    // Build where clause
    const where: any = {};

    // Filter appointments based on user role and status
    if (userRole === "CUSTOMER") {
      where.customerId = userId;
    } else if (userRole === "NOTARY") {
      where.notaryId = userId;
    } else if (userRole !== "ADMIN" && userRole !== "SECRETARY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (status && status !== "all") {
      where.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        notary: {
          select: {
            id: true,
            name: true,
            email: true,
            notaryProfile: {
              select: {
                address: true,
                city: true,
                state: true,
                zip: true,
              },
            },
          },
        },
        service: true,
        reviews: true,
      },
      orderBy: {
        scheduledTime: "desc",
      },
    });

    console.log("Found appointments:", appointments.length);
    console.log("Appointments data:", appointments);
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
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

    const userId = session.user.id;
    const body = await request.json();

    // Validate request body
    const validatedData = createAppointmentSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.issues },
        { status: 400 }
      );
    }

    const { notaryId, serviceId, scheduledTime, duration, notes } = validatedData.data;

    console.log("Creating appointment with:", {
      userId,
      notaryId,
      serviceId,
      scheduledTime,
      duration,
      notes
    });

    // Get service price
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Check for time slot conflicts
    const appointmentDateTime = new Date(scheduledTime);
    const appointmentDuration = duration || 60;
    const appointmentEndTime = new Date(appointmentDateTime.getTime() + appointmentDuration * 60000);

    // Check if notary has any overlapping appointments
    const conflictingAppointments = await prisma.appointment.findMany({
      where: {
        notaryId,
        status: {
          in: ["PENDING", "CONFIRMED"]
        },
        OR: [
          {
            // New appointment starts during existing appointment
            AND: [
              { scheduledTime: { lte: appointmentDateTime } },
              { 
                scheduledTime: {
                  gt: new Date(appointmentDateTime.getTime() - 60 * 60000) // 1 hour before
                }
              }
            ]
          },
          {
            // New appointment ends during existing appointment  
            scheduledTime: {
              lt: appointmentEndTime,
              gte: appointmentDateTime
            }
          },
          {
            // New appointment completely contains existing appointment
            AND: [
              { scheduledTime: { gte: appointmentDateTime } },
              { scheduledTime: { lt: appointmentEndTime } }
            ]
          }
        ]
      }
    });

    if (conflictingAppointments.length > 0) {
      return NextResponse.json(
        { 
          error: "Time slot conflict", 
          message: "The selected time slot conflicts with another appointment. Please choose a different time." 
        },
        { status: 409 }
      );
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        customerId: userId,
        notaryId,
        serviceId,
        scheduledTime: new Date(scheduledTime),
        duration: duration || 60, // Default to 1 hour
        status: "PENDING",
        totalCost: service.basePrice,
        notes: notes || "",
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        notary: {
          select: {
            name: true,
            email: true,
          },
        },
        service: true,
      },
    });

    // Send notifications
    try {
      await NotificationService.notifyAppointmentCreated(
        userId,
        notaryId,
        appointment.id,
        service.name,
        new Date(scheduledTime)
      );
    } catch (notificationError) {
      console.error("Failed to send appointment creation notifications:", notificationError);
      // Don't fail the appointment creation if notifications fail
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}