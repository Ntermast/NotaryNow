import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";
import { prisma } from "@/lib/db";
import { z } from "zod";

const slotSchema = z.object({
  start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid start time"),
  end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid end time"),
});

const availabilitySchema = z.record(
  z.string(),
  z.object({
    enabled: z.boolean(),
    slots: z.array(slotSchema),
  })
);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "NOTARY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const profile = await prisma.notaryProfile.findUnique({
      where: { userId: session.user.id },
      select: { availabilityConfig: true },
    });

    const parsed = profile?.availabilityConfig
      ? JSON.parse(profile.availabilityConfig)
      : null;

    return NextResponse.json({ availability: parsed });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "NOTARY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = availabilitySchema.safeParse(body.availability);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid availability data", details: validation.error.issues },
        { status: 400 }
      );
    }

    await prisma.notaryProfile.update({
      where: { userId: session.user.id },
      data: {
        availabilityConfig: JSON.stringify(validation.data),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving availability:", error);
    return NextResponse.json(
      { error: "Failed to save availability" },
      { status: 500 }
    );
  }
}

