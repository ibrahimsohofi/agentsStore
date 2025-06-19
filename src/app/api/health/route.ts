import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Test database connection
    await prisma.user.count()

    // Count key entities
    const [userCount, agentCount, orderCount] = await Promise.all([
      prisma.user.count(),
      prisma.agent.count(),
      prisma.order.count()
    ])

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      data: {
        users: userCount,
        agents: agentCount,
        orders: orderCount
      },
      version: "1.0.0"
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: "Database connection failed"
      },
      { status: 500 }
    )
  }
}
