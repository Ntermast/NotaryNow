import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET a single service by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = params.id;
    
    const service = await prisma.service.findUnique({
      where: {
        id: serviceId
      },
      include: {
        _count: {
          select: {
            notaries: true,
            appointments: true
          }
        }
      }
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    );
  }
}

// PATCH to update a service
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const serviceId = params.id;
    const body = await request.json();
    const { name, description, basePrice } = body;

    // Validate that at least one field is provided
    if (!name && !description && basePrice === undefined) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    
    if (basePrice !== undefined) {
      const price = parseFloat(basePrice);
      if (isNaN(price) || price < 0) {
        return NextResponse.json(
          { error: "Base price must be a valid positive number" },
          { status: 400 }
        );
      }
      updateData.basePrice = price;
    }

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: {
        id: serviceId
      }
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Update the service
    const updatedService = await prisma.service.update({
      where: {
        id: serviceId
      },
      data: updateData,
      include: {
        _count: {
          select: {
            notaries: true,
            appointments: true
          }
        }
      }
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);
    
    // Check for unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A service with this name already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

// DELETE a service
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const serviceId = params.id;

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: {
        id: serviceId
      },
      include: {
        _count: {
          select: {
            notaries: true,
            appointments: true
          }
        }
      }
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Check if service is in use
    if (existingService._count.notaries > 0 || existingService._count.appointments > 0) {
      return NextResponse.json(
        { error: "Cannot delete service that is in use by notaries or appointments" },
        { status: 400 }
      );
    }

    // Delete the service
    await prisma.service.delete({
      where: {
        id: serviceId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}