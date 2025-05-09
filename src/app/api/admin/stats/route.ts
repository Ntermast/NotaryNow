import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get total users count
    const totalUsers = await prisma.user.count();

    // Get notaries count
    const totalNotaries = await prisma.user.count({
      where: { role: "NOTARY" }
    });

    // Get pending notary approvals count
    const pendingApprovals = await prisma.notaryProfile.count({
      where: { isApproved: false }
    });

    // Get total appointments count
    const totalAppointments = await prisma.appointment.count();

    // Get customers count
    const totalCustomers = await prisma.user.count({
      where: { role: "CUSTOMER" }
    });

    // Get total services count
    const totalServices = await prisma.service.count();

    // Get total certifications count
    const totalCertifications = await prisma.certification.count();

    // Get pending certification approvals count (assuming documentUrl presence means pending)
    const pendingCertifications = await prisma.notaryCertification.count({
      where: {
        documentUrl: {
          not: null
        }
      }
    });

    // Get total recent appointments (last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const recentAppointments = await prisma.appointment.count({
      where: {
        createdAt: {
          gte: lastWeek
        }
      }
    });

    const stats = {
      totalUsers,
      totalNotaries,
      pendingApprovals,
      totalAppointments,
      totalCustomers,
      totalServices,
      totalCertifications,
      pendingCertifications,
      recentAppointments
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}