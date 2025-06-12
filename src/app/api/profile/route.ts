import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  image: z.string().url().optional().or(z.literal(""))
})

const sellerOnboardingSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().min(1, "Full name is required"),
    bio: z.string().min(100, "Bio must be at least 100 characters"),
    profileImage: z.string().optional()
  }),
  businessInfo: z.object({
    businessName: z.string().optional(),
    businessType: z.string().optional(),
    website: z.string().optional(),
    address: z.string().min(1, "Address is required"),
    phoneNumber: z.string().optional(),
    taxId: z.string().optional()
  }),
  sellerInfo: z.object({
    experience: z.string().min(1, "Experience level is required"),
    specialization: z.array(z.string()).min(1, "At least one specialization is required"),
    portfolio: z.string().optional(),
    expectedRevenue: z.string().optional()
  }),
  agreements: z.object({
    termsOfService: z.boolean().refine(val => val === true, "Must agree to terms of service"),
    sellerAgreement: z.boolean().refine(val => val === true, "Must agree to seller agreement"),
    taxCompliance: z.boolean().refine(val => val === true, "Must acknowledge tax compliance"),
    qualityStandards: z.boolean().refine(val => val === true, "Must commit to quality standards")
  })
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        company: true,
        website: true,
        image: true,
        role: true,
        verified: true,
        createdAt: true,
        totalSales: true,
        totalRevenue: true,
        rating: true,
        reviewCount: true,
        _count: {
          select: {
            orders: true,
            agents: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate user stats
    const userStats = {
      totalPurchases: user._count.orders,
      totalSpent: user.role === "BUYER" ? await calculateTotalSpent(user.id) : 0,
      agentsSold: user._count.agents,
      totalRevenue: user.totalRevenue,
      averageRating: user.rating,
      reviewCount: user.reviewCount
    }

    return NextResponse.json({
      user: {
        ...user,
        stats: userStats
      }
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, bio, company, website, image } = updateProfileSchema.parse(body)

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(company !== undefined && { company }),
        ...(website !== undefined && { website: website || null }),
        ...(image !== undefined && { image: image || null })
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        company: true,
        website: true,
        image: true,
        role: true,
        verified: true
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    if (body.action === "seller-onboarding") {
      const onboardingData = sellerOnboardingSchema.parse(body.data)

      // Update user with seller information
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: onboardingData.personalInfo.fullName,
          bio: onboardingData.personalInfo.bio,
          company: onboardingData.businessInfo.businessName || null,
          website: onboardingData.businessInfo.website || null,
          role: "SELLER", // Promote to seller
          // Store additional seller data in user fields
          // In a real app, you might want a separate SellerProfile table
        }
      })

      // Log the seller onboarding application
      // In a real app, you might want to create a SellerApplication table
      // for tracking the application status and review process

      return NextResponse.json({
        success: true,
        message: "Seller application submitted successfully",
        user: updatedUser
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function calculateTotalSpent(userId: string): Promise<number> {
  const orders = await prisma.order.findMany({
    where: {
      buyerId: userId,
      status: "COMPLETED"
    },
    select: {
      totalAmount: true
    }
  })

  return orders.reduce((total, order) => total + order.totalAmount, 0)
}
