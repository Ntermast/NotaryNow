import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";
import { NotificationService } from "@/lib/notifications";
import { z } from "zod";
import { Prisma } from "@prisma/client";

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
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get("status");
    const queryParams = {
      status: statusParam === null ? undefined : statusParam,
    };

    const validatedQuery = appointmentQuerySchema.safeParse(queryParams);

    if (!validatedQuery.success) {
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

    return NextResponse.json(appointments);
  } catch (error) {
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

    const notaryProfile = await prisma.notaryProfile.findUnique({
      where: { userId: notaryId },
      include: {
        notaryServices: {
          where: { serviceId },
          include: {
            service: true,
          },
        },
      },
    });

    if (!notaryProfile || notaryProfile.approvalStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "Notary is not available for bookings" },
        { status: 400 }
      );
    }

    const serviceOffering = notaryProfile.notaryServices[0];

    if (!serviceOffering) {
      return NextResponse.json(
        { error: "Selected notary does not offer this service" },
        { status: 400 }
      );
    }

    if (serviceOffering.status !== "APPROVED") {
      return NextResponse.json(
        { error: "This service is not yet approved for the selected notary." },
        { status: 400 }
      );
    }

    const servicePrice = serviceOffering.customPrice ?? serviceOffering.service.basePrice;

    const appointmentStart = new Date(scheduledTime);
    const appointmentDuration = duration || 60;
    const appointmentEnd = new Date(
      appointmentStart.getTime() + appointmentDuration * 60000
    );

    // Check for any conflicting appointments at this time slot
    const conflictingAppointments = await prisma.$queryRaw<Array<{ id: string; customerId: string; serviceId: string }>>(
      Prisma.sql`
        SELECT "id", "customerId", "serviceId"
        FROM "Appointment"
        WHERE "notaryId" = ${notaryId}
          AND "status" IN ('PENDING', 'CONFIRMED')
          AND "scheduledTime" < ${appointmentEnd.toISOString()}
          AND datetime("scheduledTime", '+' || "duration" || ' minutes') > ${appointmentStart.toISOString()}
      `
    );

    if (conflictingAppointments.length > 0) {
      // Check if any conflict is from a different customer - block immediately
      const conflictWithOtherCustomer = conflictingAppointments.find(
        (apt) => apt.customerId !== userId
      );

      if (conflictWithOtherCustomer) {
        return NextResponse.json(
          {
            error: "Time slot conflict",
            message: "The selected time slot is already booked. Please choose a different time."
          },
          { status: 409 }
        );
      }

      // Check if same customer already has this exact service at this time
      const duplicateService = conflictingAppointments.find(
        (apt) => apt.customerId === userId && apt.serviceId === serviceId
      );

      if (duplicateService) {
        return NextResponse.json(
          {
            error: "Duplicate booking",
            message: "You have already booked this service at this time slot."
          },
          { status: 409 }
        );
      }

      // If we reach here, same customer is booking a DIFFERENT service at the same time - allow it
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
        totalCost: servicePrice,
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
        serviceOffering.service.name,
        new Date(scheduledTime)
      );
    } catch (notificationError) {
      // Don't fail the appointment creation if notifications fail
    }

    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
