import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";
import { z } from "zod";

// Validation schema
const createServiceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  basePrice: z.number().min(0, "Price must be positive").max(10000, "Price too high"),
});

// GET all services
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
        name: 'asc'
      }
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

// POST to create a new service
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

    const body = await request.json();

    // Validate request body
    const validatedData = createServiceSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.issues },
        { status: 400 }
      );
    }

    const { name, description, basePrice } = validatedData.data;

    // Create the service
    const newService = await prisma.service.create({
      data: {
        name,
        description,
        basePrice
      }
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (error: any) {
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