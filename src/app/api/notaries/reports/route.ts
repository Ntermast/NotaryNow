import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";
import { z } from "zod";

// Validation schema for query parameters
const reportsQuerySchema = z.object({
  period: z.enum(["week", "month", "quarter", "year"]).optional().default("month"),
  type: z.enum(["revenue", "appointments", "services"]).optional().default("revenue"),
});

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
    const searchParams = request.nextUrl.searchParams;
    
    const validatedQuery = reportsQuerySchema.safeParse({
      period: searchParams.get("period"),
      type: searchParams.get("type"),
    });

    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validatedQuery.error.issues },
        { status: 400 }
      );
    }

    const { period, type } = validatedQuery.data;

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter":
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Fetch appointments for the notary within the date range
    const appointments = await prisma.appointment.findMany({
      where: {
        notaryId,
        scheduledTime: {
          gte: startDate,
          lte: now,
        },
        status: {
          in: ["COMPLETED", "CONFIRMED", "PENDING"]
        }
      },
      include: {
        service: {
          select: {
            name: true,
            basePrice: true,
          }
        }
      },
      orderBy: {
        scheduledTime: "asc"
      }
    });

    // Get completed appointments for revenue calculation
    const completedAppointments = appointments.filter(app => app.status === "COMPLETED");
    
    // Calculate statistics
    const totalRevenue = completedAppointments.reduce((sum, app) => sum + app.totalCost, 0);
    const totalAppointments = appointments.length;
    const completedCount = completedAppointments.length;
    const pendingCount = appointments.filter(app => app.status === "PENDING").length;
    const confirmedCount = appointments.filter(app => app.status === "CONFIRMED").length;

    // Group data by time period for charts
    const chartData = [];
    const periodData = new Map();

    appointments.forEach(appointment => {
      const date = new Date(appointment.scheduledTime);
      let key: string;

      switch (period) {
        case "week":
          key = date.toLocaleDateString('en-US', { weekday: 'short' });
          break;
        case "month":
          key = date.getDate().toString().padStart(2, '0');
          break;
        case "quarter":
        case "year":
          key = date.toLocaleDateString('en-US', { month: 'short' });
          break;
        default:
          key = date.toLocaleDateString();
      }

      if (!periodData.has(key)) {
        periodData.set(key, {
          period: key,
          revenue: 0,
          appointments: 0,
          completed: 0
        });
      }

      const data = periodData.get(key);
      data.appointments += 1;
      if (appointment.status === "COMPLETED") {
        data.revenue += appointment.totalCost;
        data.completed += 1;
      }
    });

    // Convert to array and sort
    const sortedData = Array.from(periodData.values());

    // Service breakdown
    const serviceStats = new Map();
    completedAppointments.forEach(appointment => {
      const serviceName = appointment.service.name;
      if (!serviceStats.has(serviceName)) {
        serviceStats.set(serviceName, {
          name: serviceName,
          count: 0,
          revenue: 0
        });
      }
      const stats = serviceStats.get(serviceName);
      stats.count += 1;
      stats.revenue += appointment.totalCost;
    });

    const topServices = Array.from(serviceStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate average metrics
    const averageRevenue = completedCount > 0 ? totalRevenue / completedCount : 0;
    const completionRate = totalAppointments > 0 ? (completedCount / totalAppointments) * 100 : 0;

    // Get recent month data for comparison
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const lastMonthAppointments = await prisma.appointment.findMany({
      where: {
        notaryId,
        scheduledTime: {
          gte: lastMonth,
          lte: lastMonthEnd,
        },
        status: "COMPLETED"
      }
    });

    const lastMonthRevenue = lastMonthAppointments.reduce((sum, app) => sum + app.totalCost, 0);
    const revenueGrowth = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    const response = {
      summary: {
        totalRevenue,
        totalAppointments,
        completedAppointments: completedCount,
        pendingAppointments: pendingCount,
        confirmedAppointments: confirmedCount,
        averageRevenue: Math.round(averageRevenue),
        completionRate: Math.round(completionRate * 100) / 100,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100
      },
      chartData: sortedData,
      topServices,
      period,
      dateRange: {
        from: startDate.toISOString(),
        to: now.toISOString()
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching notary reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}