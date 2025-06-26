import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";
import { z } from "zod";

// Validation schema
const updateAppointmentSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]).optional(),
  rescheduledTime: z.string().datetime("Invalid date format").optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);

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

    const userId = session.user.id;
    const userRole = session.user.role;

    const appointment = await prisma.appointment.findUnique({
      where: {
        id,
      },
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
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this appointment
    if (
      userRole !== "ADMIN" &&
      userRole !== "SECRETARY" &&
      appointment.customerId !== userId &&
      appointment.notaryId !== userId
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment" },
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

    const userId = session.user.id;
    const userRole = session.user.role;
    const body = await request.json();

    // Validate request body
    const validatedData = updateAppointmentSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.issues },
        { status: 400 }
      );
    }

    const { status, rescheduledTime, notes } = validatedData.data;

    const appointment = await prisma.appointment.findUnique({
      where: {
        id,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check permissions for update
    const isCustomer = appointment.customerId === userId;
    const isNotary = appointment.notaryId === userId;
    const isAdminOrSecretary = userRole === "ADMIN" || userRole === "SECRETARY";

    if (!isCustomer && !isNotary && !isAdminOrSecretary) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Only certain roles can update certain fields
    const updateData: any = {};

    if (status) {
      // Customers can only cancel their appointments
      if (isCustomer && status !== "CANCELLED") {
        return NextResponse.json(
          { error: "Customers can only cancel appointments" },
          { status: 403 }
        );
      }

      // Notaries can confirm, complete, or cancel
      if (isNotary && !["CONFIRMED", "COMPLETED", "CANCELLED"].includes(status)) {
        return NextResponse.json(
          { error: "Invalid status for notary" },
          { status: 403 }
        );
      }

      updateData.status = status;
    }

    if (rescheduledTime) {
      // Only allow rescheduling if appointment is not completed or cancelled
      if (["COMPLETED", "CANCELLED"].includes(appointment.status)) {
        return NextResponse.json(
          { error: "Cannot reschedule completed or cancelled appointments" },
          { status: 400 }
        );
      }

      updateData.scheduledTime = new Date(rescheduledTime);
    }

    if (notes) {
      updateData.notes = notes;
    }

    const updatedAppointment = await prisma.appointment.update({
      where: {
        id,
      },
      data: updateData,
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

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}