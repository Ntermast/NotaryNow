// src/app/api/services/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const services = await prisma.service.findMany({
      include: {
        _count: {
          select: {
            notaries: true,
            appointments: true
          }
        }
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
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

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { name, description, basePrice } = body;

    // Validate required fields
    if (!name || !description || basePrice === undefined) {
      return NextResponse.json(
        { error: "Name, description, and basePrice are required" },
        { status: 400 }
      );
    }

    // Parse price to ensure it's a number
    const price = parseFloat(basePrice);
    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Base price must be a valid positive number" },
        { status: 400 }
      );
    }

    // Create new service
    const newService = await prisma.service.create({
      data: {
        name,
        description,
        basePrice: price
      }
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);

    // Check for unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A service with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}