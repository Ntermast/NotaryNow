import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const notarySearchSchema = z.object({
  zipCode: z.string().max(50, "Location name too long").optional(),
  service: z.string().max(100, "Service name too long").optional(),
  maxDistance: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Invalid distance format")
    .optional(),
  maxRate: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Invalid rate format")
    .optional(),
});

function formatLocation(city?: string | null, zip?: string | null, state?: string | null) {
  const district = city ? `${city} District` : "";
  const sector = zip ? `${zip} Sector` : "";
  const province = state ? `${state} Province` : "";

  return [district, sector, province].filter(Boolean).join(", ");
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      zipCode: searchParams.get("zipCode"),
      service: searchParams.get("service"),
      maxDistance: searchParams.get("maxDistance"),
      maxRate: searchParams.get("maxRate"),
    };

    const filteredParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, v]) => v !== null)
    );

    const validatedQuery = notarySearchSchema.safeParse(filteredParams);

    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validatedQuery.error.issues },
        { status: 400 }
      );
    }

    const { zipCode, service, maxRate } = validatedQuery.data;

    const baseWhere: any = {
      isApproved: true,
      approvalStatus: "APPROVED",
    };

    const notaryProfiles = await prisma.notaryProfile.findMany({
      where: baseWhere,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        notaryServices: {
          where: {
            status: "APPROVED",
          },
          include: {
            service: true,
          },
        },
        certifications: {
          include: {
            certification: true,
          },
        },
      },
    });

    let filteredProfiles = notaryProfiles;

    if (zipCode) {
      const searchTerm = zipCode.toLowerCase();
      filteredProfiles = filteredProfiles.filter((profile) =>
        profile.city?.toLowerCase().includes(searchTerm) ||
        profile.state?.toLowerCase().includes(searchTerm) ||
        profile.zip?.toLowerCase().includes(searchTerm) ||
        profile.address?.toLowerCase().includes(searchTerm)
      );
    }

    if (service && service !== "All Services") {
      filteredProfiles = filteredProfiles.filter((profile) =>
        profile.notaryServices.some((ns) => ns.service.name === service)
      );
    }

    const notaryIds = filteredProfiles.map((profile) => profile.user.id);

    const reviews = await prisma.review.findMany({
      where: {
        appointment: {
          notaryId: {
            in: notaryIds,
          },
        },
      },
      select: {
        rating: true,
        appointment: {
          select: {
            notaryId: true,
          },
        },
      },
    });

    const reviewStats = new Map<
      string,
      {
        count: number;
        totalRating: number;
      }
    >();

    reviews.forEach((review) => {
      const notaryId = review.appointment.notaryId;
      if (!reviewStats.has(notaryId)) {
        reviewStats.set(notaryId, { count: 0, totalRating: 0 });
      }
      const stats = reviewStats.get(notaryId)!;
      stats.count += 1;
      stats.totalRating += review.rating;
    });

    const notaries = filteredProfiles
      .map((profile) => {
        const services = profile.notaryServices.map((ns) => {
          const effectivePrice = ns.customPrice ?? ns.service.basePrice;
          return {
            id: ns.serviceId,
            name: ns.service.name,
            description: ns.service.description,
            basePrice: ns.service.basePrice,
            customPrice: ns.customPrice,
            price: effectivePrice,
          };
        });

        if (services.length === 0) {
          return null;
        }

        const startingPrice = Math.min(...services.map((service) => service.price));

        if (maxRate && startingPrice > parseFloat(maxRate)) {
          return null;
        }

        const stats = reviewStats.get(profile.user.id);

        return {
          id: profile.user.id,
          name: profile.user.name,
          photo: "",
          contactEmail: profile.user.email,
          notaryType: profile.notaryType,
          location: {
            district: profile.city,
            sector: profile.zip,
            province: profile.state,
            formatted: formatLocation(profile.city, profile.zip, profile.state),
          },
          distanceKm: null,
          hourlyRate: profile.hourlyRate,
          startingPrice,
          rating:
            stats && stats.count > 0
              ? parseFloat((stats.totalRating / stats.count).toFixed(1))
              : profile.averageRating,
          reviewCount: stats?.count ?? 0,
          services,
          certifications: profile.certifications.map((c) => ({
            id: c.certification.id,
            name: c.certification.name,
          })),
          availableToday: Math.random() > 0.5,
          experienceYears: Math.max(
            1,
            Math.min(25, Math.floor(Math.random() * 10) + 1)
          ),
        };
      })
      .filter((profile): profile is NonNullable<typeof profile> => Boolean(profile));

    return NextResponse.json(notaries);
  } catch (error) {
    console.error("Error fetching notaries:", error);
    return NextResponse.json(
      { error: "Failed to fetch notaries" },
      { status: 500 }
    );
  }
}
