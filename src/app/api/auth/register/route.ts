// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcrypt";
import { z } from "zod";

// Schema validation for registration
const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  phone: z.string().optional(),
  role: z.enum(["CUSTOMER", "NOTARY"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input data
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const error = result.error.format();
      return NextResponse.json({ error }, { status: 400 });
    }

    const { name, email, password, phone, role } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phone,
      },
    });

    // If registering as a notary, create a notary profile
    if (role === "NOTARY") {
      await prisma.notaryProfile.create({
        data: {
          userId: user.id,
          isApproved: false, // Requires admin approval
          approvalStatus: "PENDING",
          address: "",
          city: "",
          state: "",
          zip: "",
          hourlyRate: 0,
          averageRating: 0,
        },
      });
    }

    // Return success but exclude password
    
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
