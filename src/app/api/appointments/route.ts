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

    const userId = session.user.id;
    const userRole = session.user.role;

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

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

    const { notaryId, serviceId, scheduledTime, duration, notes } = body;

    if (!notaryId || !serviceId || !scheduledTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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
        status: "pending",
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