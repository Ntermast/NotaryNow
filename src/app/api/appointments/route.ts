import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      status: searchParams.get("status"),
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

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}