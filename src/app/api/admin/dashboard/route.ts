import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('range') || '30d'

    // Calculate date range
    const now = new Date()
    const startDate = new Date()

    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Platform overview metrics
    const totalUsers = await prisma.user.count()
    const totalAgents = await prisma.agent.count()
    const totalOrders = await prisma.order.count({
      where: { status: 'COMPLETED' }
    })
    const totalRevenue = await prisma.order.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate }
      },
      _sum: { totalAmount: true }
    })

    // User statistics
    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: startDate } }
    })
    const activeUsers = await prisma.user.count({
      where: {
        OR: [
          { orders: { some: { createdAt: { gte: startDate } } } },
          { agents: { some: { createdAt: { gte: startDate } } } }
        ]
      }
    })

    // Agent statistics
    const pendingAgents = await prisma.agent.count({
      where: { status: 'PENDING_REVIEW' }
    })
    const approvedAgents = await prisma.agent.count({
      where: { status: 'APPROVED' }
    })
    const rejectedAgents = await prisma.agent.count({
      where: { status: 'REJECTED' }
    })

    // Recent activities
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        verified: true
      }
    })

    const recentAgents = await prisma.agent.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          select: { name: true, email: true }
        }
      }
    })

    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: {
          select: { name: true, email: true }
        },
        agent: {
          select: { name: true, price: true }
        }
      }
    })

    // Pending reviews and reports
    const pendingTests = await prisma.agentTest.count({
      where: { status: 'PENDING' }
    })

    const systemAlerts = await prisma.notification.count({
      where: {
        type: 'SYSTEM_ALERT',
        read: false
      }
    })

    // Financial metrics
    const platformFee = (totalRevenue._sum.totalAmount || 0) * 0.1
    const totalPayouts = (totalRevenue._sum.totalAmount || 0) * 0.9

    // User growth data (last 30 days)
    const userGrowthData = await generateGrowthData('user', startDate, now)
    const agentGrowthData = await generateGrowthData('agent', startDate, now)
    const revenueGrowthData = await generateRevenueGrowthData(startDate, now)

    // Category distribution
    const categoryStats = await prisma.agent.groupBy({
      by: ['category'],
      _count: { category: true },
      where: { status: 'APPROVED' }
    })

    // Top sellers
    const topSellers = await prisma.user.findMany({
      where: { role: 'SELLER' },
      include: {
        agents: {
          include: {
            orders: {
              where: { status: 'COMPLETED' }
            }
          }
        }
      },
      take: 10
    })

    const processedTopSellers = topSellers
      .map(seller => ({
        id: seller.id,
        name: seller.name,
        email: seller.email,
        totalAgents: seller.agents.length,
        totalSales: seller.agents.reduce((sum, agent) => sum + agent.orders.length, 0),
        totalRevenue: seller.agents.reduce((sum, agent) =>
          sum + agent.orders.reduce((orderSum, order) => orderSum + order.totalAmount, 0), 0)
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)

    return NextResponse.json({
      overview: {
        totalUsers,
        totalAgents,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        newUsers,
        activeUsers,
        pendingAgents,
        approvedAgents,
        rejectedAgents,
        pendingTests,
        systemAlerts,
        platformFee,
        totalPayouts
      },
      charts: {
        userGrowth: userGrowthData,
        agentGrowth: agentGrowthData,
        revenueGrowth: revenueGrowthData,
        categoryDistribution: categoryStats.map(stat => ({
          category: stat.category,
          count: stat._count.category
        }))
      },
      recent: {
        users: recentUsers,
        agents: recentAgents,
        orders: recentOrders
      },
      topSellers: processedTopSellers
    })

  } catch (error) {
    console.error('Error fetching admin dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

async function generateGrowthData(type: 'user' | 'agent', startDate: Date, endDate: Date) {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const data = []

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const nextDate = new Date(date)
    nextDate.setDate(date.getDate() + 1)

    let count: number
    if (type === 'user') {
      count = await prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      })
    } else {
      count = await prisma.agent.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      })
    }

    data.push({
      date: date.toISOString().split('T')[0],
      count
    })
  }

  return data
}

async function generateRevenueGrowthData(startDate: Date, endDate: Date) {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const data = []

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const nextDate = new Date(date)
    nextDate.setDate(date.getDate() + 1)

    const revenue = await prisma.order.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: date,
          lt: nextDate
        }
      },
      _sum: { totalAmount: true }
    })

    data.push({
      date: date.toISOString().split('T')[0],
      revenue: revenue._sum.totalAmount || 0
    })
  }

  return data
}
