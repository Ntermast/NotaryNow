// src/app/api/certifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import getServerSession from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const certifications = await prisma.certification.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(certifications);
  } catch (error) {
    console.error("Error fetching certifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch certifications" },
      { status: 500 }
    );
  }
}