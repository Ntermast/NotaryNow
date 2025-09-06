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

    if (session.user.role !== "NOTARY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const notaryId = session.user.id;

    // Get all customers who have had appointments with this notary
    const appointments = await prisma.appointment.findMany({
      where: {
        notaryId: notaryId,
        status: {
          in: ["CONFIRMED", "COMPLETED"]
        }
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        }
      },
      orderBy: {
        scheduledTime: "desc"
      }
    });

    // Group appointments by customer and calculate stats
    const customerMap = new Map();
    
    appointments.forEach(appointment => {
      const customer = appointment.customer;
      if (!customerMap.has(customer.id)) {
        customerMap.set(customer.id, {
          ...customer,
          appointmentsCount: 0,
          lastAppointment: appointment.scheduledTime,
          firstAppointment: appointment.scheduledTime
        });
      }
      
      const customerData = customerMap.get(customer.id);
      customerData.appointmentsCount += 1;
      
      // Update last appointment if this one is more recent
      if (new Date(appointment.scheduledTime) > new Date(customerData.lastAppointment)) {
        customerData.lastAppointment = appointment.scheduledTime;
      }
      
      // Update first appointment if this one is earlier
      if (new Date(appointment.scheduledTime) < new Date(customerData.firstAppointment)) {
        customerData.firstAppointment = appointment.scheduledTime;
      }
    });

    const customers = Array.from(customerMap.values());

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching notary customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}