// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";
import { NotificationService } from "@/lib/notifications";
import { z } from "zod";

// Schema validation for creating a review
const reviewSchema = z.object({
  appointmentId: z.string().nonempty({ message: "Appointment ID is required" }),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const notaryId = searchParams.get("notaryId");

    if (!notaryId) {
      return NextResponse.json(
        { error: "Notary ID is required" },
        { status: 400 }
      );
    }

    // Find the notary user
    const notaryUser = await prisma.user.findUnique({
      where: {
        id: notaryId,
        role: "NOTARY",
      },
    });

    if (!notaryUser) {
      return NextResponse.json(
        { error: "Notary not found" },
        { status: 404 }
      );
    }

    // Get all reviews for the notary
    const reviews = await prisma.review.findMany({
      where: {
        appointment: {
          notaryId: notaryId,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        appointment: {
          select: {
            id: true,
            scheduledTime: true,
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
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

    // Validate input data
    const result = reviewSchema.safeParse(body);
    if (!result.success) {
      const error = result.error.format();
      return NextResponse.json({ error }, { status: 400 });
    }

    const { appointmentId, rating, comment } = body;

    // Verify the appointment exists and belongs to the user
    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        reviews: true,
        service: true,
        notary: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!appointment || appointment.customerId !== userId) {
      return NextResponse.json(
        { error: "Appointment not found or cannot be reviewed" },
        { status: 404 }
      );
    }

    const now = new Date();
    const scheduledTime = new Date(appointment.scheduledTime);
    const isEligibleStatus =
      appointment.status === "COMPLETED" ||
      (appointment.status === "CONFIRMED" && scheduledTime <= now);

    if (!isEligibleStatus) {
      return NextResponse.json(
        { error: "You can only review appointments that have been completed." },
        { status: 400 }
      );
    }

    // Check if the user has already reviewed this appointment
    if (appointment.reviews.length > 0) {
      return NextResponse.json(
        { error: "Appointment has already been reviewed" },
        { status: 400 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        appointmentId,
        customerId: userId,
        rating,
        comment: comment || "",
      },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
        appointment: {
          select: {
            service: true,
            notaryId: true,
          },
        },
      },
    });

    // Update the notary's average rating
    const notaryId = appointment.notaryId;
    const notaryUser = await prisma.user.findUnique({
      where: { id: notaryId },
      include: {
        notaryProfile: true,
      },
    });

    if (notaryUser && notaryUser.notaryProfile) {
      // Get all reviews for this notary
      const allReviews = await prisma.review.findMany({
        where: {
          appointment: {
            notaryId: notaryId,
          },
        },
        select: {
          rating: true,
        },
      });

      // Calculate new average rating
      const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
      const averageRating = allReviews.length > 0 ? sum / allReviews.length : 0;

      // Update notary profile with new average rating
      await prisma.notaryProfile.update({
        where: {
          id: notaryUser.notaryProfile.id,
        },
        data: {
          averageRating,
        },
      });
    }

    try {
      await NotificationService.create({
        userId: appointment.notaryId,
        type: "SYSTEM_ALERT",
        title: "New Review Received",
        message: `You received a ${rating}-star review for ${appointment.service.name}.`,
        actionUrl: `/dashboard/notary/appointments?id=${appointment.id}`,
        metadata: {
          appointmentId,
          rating,
          comment,
          type: "review",
        },
      });
    } catch (notificationError) {
      console.error("Failed to send review notification:", notificationError);
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
