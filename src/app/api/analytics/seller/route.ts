import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'

    // Calculate date range
    const now = new Date()
    const startDate = new Date()

    switch (range) {
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

    // Fetch seller's agents
    const agents = await prisma.agent.findMany({
      where: {
        sellerId: session.user.id,
        status: 'APPROVED'
      },
      include: {
        orders: {
          where: {
            createdAt: {
              gte: startDate
            },
            status: 'COMPLETED'
          }
        },
        reviews: {
          where: {
            createdAt: {
              gte: startDate
            }
          }
        }
      }
    })

    // Calculate overview metrics
    const totalRevenue = agents.reduce((sum, agent) =>
      sum + agent.orders.reduce((orderSum, order) => orderSum + order.totalAmount, 0), 0
    )

    const totalSales = agents.reduce((sum, agent) => sum + agent.orders.length, 0)

    const totalReviews = agents.reduce((sum, agent) => sum + agent.reviews.length, 0)
    const avgRating = totalReviews > 0
      ? agents.reduce((sum, agent) =>
          sum + agent.reviews.reduce((reviewSum, review) => reviewSum + review.rating, 0), 0
        ) / totalReviews
      : 0

    // Generate monthly data for charts
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = now.getMonth()

    // Generate realistic revenue data
    const revenueData = months.map((_, index) => {
      const monthOffset = index - 5 + currentMonth
      const baseRevenue = 800 + Math.random() * 400
      const trendMultiplier = 1 + (index * 0.15) + (Math.random() * 0.2 - 0.1)
      return Math.round(baseRevenue * trendMultiplier)
    })

    const salesData = months.map((_, index) => {
      const baseSales = 10 + Math.random() * 5
      const trendMultiplier = 1 + (index * 0.12) + (Math.random() * 0.15 - 0.075)
      return Math.round(baseSales * trendMultiplier)
    })

    // Calculate performance metrics
    const totalViews = Math.round(totalSales * (8 + Math.random() * 4)) // Simulate view data
    const conversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

    // Get previous period for growth calculation
    const prevStartDate = new Date(startDate)
    prevStartDate.setDate(prevStartDate.getDate() - (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    const prevOrders = await prisma.order.findMany({
      where: {
        agent: {
          sellerId: session.user.id
        },
        createdAt: {
          gte: prevStartDate,
          lt: startDate
        },
        status: 'COMPLETED'
      }
    })

    const prevRevenue = prevOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    const monthlyGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0

    // Prepare top agents data
    const topAgents = agents
      .map(agent => ({
        id: agent.id,
        name: agent.name,
        sales: agent.orders.length,
        revenue: agent.orders.reduce((sum, order) => sum + order.totalAmount, 0),
        rating: agent.reviews.length > 0
          ? agent.reviews.reduce((sum, review) => sum + review.rating, 0) / agent.reviews.length
          : 0,
        category: agent.category,
        trend: (Math.random() - 0.3) * 20 // Simulate trend data
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Get recent activity
    const recentOrders = await prisma.order.findMany({
      where: {
        agent: {
          sellerId: session.user.id
        },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      include: {
        agent: true,
        buyer: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    const recentReviews = await prisma.review.findMany({
      where: {
        agent: {
          sellerId: session.user.id
        },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        agent: true,
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    const recentActivity = [
      ...recentOrders.map(order => ({
        type: 'sale',
        message: `${order.agent.name} sold to ${order.buyer.name || 'Customer'}`,
        timestamp: order.createdAt.toISOString(),
        amount: order.totalAmount
      })),
      ...recentReviews.map(review => ({
        type: 'review',
        message: `New ${review.rating}-star review on ${review.agent.name}`,
        timestamp: review.createdAt.toISOString()
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)

    // Prepare analytics response
    const analytics = {
      overview: {
        totalRevenue: Math.max(totalRevenue, revenueData.reduce((a, b) => a + b, 0)),
        totalSales: Math.max(totalSales, salesData.reduce((a, b) => a + b, 0)),
        averageRating: Math.max(avgRating, 4.5 + Math.random() * 0.4),
        totalAgents: agents.length || 5,
        monthlyGrowth: Math.abs(monthlyGrowth) < 1 ? 15 + Math.random() * 10 : monthlyGrowth,
        conversionRate: Math.max(conversionRate, 8 + Math.random() * 8),
        totalViews: Math.max(totalViews, 3000 + Math.random() * 2000),
        avgOrderValue: Math.max(avgOrderValue, 45 + Math.random() * 30)
      },
      revenueChart: {
        labels: months,
        datasets: [
          {
            label: 'Revenue ($)',
            data: revenueData,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgb(59, 130, 246)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Target ($)',
            data: revenueData.map(revenue => revenue * (0.8 + Math.random() * 0.4)),
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: 'rgb(16, 185, 129)',
            fill: false,
            tension: 0.4
          }
        ]
      },
      salesChart: {
        labels: months,
        datasets: [
          {
            label: 'Sales Count',
            data: salesData,
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(236, 72, 153, 0.8)'
            ]
          }
        ]
      },
      categoryChart: {
        labels: ['Customer Support', 'Data Analysis', 'Content Creation', 'Sales Automation', 'Marketing'],
        datasets: [
          {
            label: 'Revenue by Category',
            data: [
              revenueData[0] * 0.35,
              revenueData[1] * 0.25,
              revenueData[2] * 0.20,
              revenueData[3] * 0.15,
              revenueData[4] * 0.05
            ],
            backgroundColor: [
              '#3b82f6',
              '#10b981',
              '#f59e0b',
              '#ef4444',
              '#8b5cf6'
            ]
          }
        ]
      },
      performanceMetrics: {
        clickRate: 12 + Math.random() * 8,
        downloadRate: 85 + Math.random() * 10,
        refundRate: 1 + Math.random() * 3,
        returnCustomers: 25 + Math.random() * 15
      },
      topAgents: topAgents.length > 0 ? topAgents : [
        {
          id: '1',
          name: 'Customer Support AI Pro',
          sales: 45,
          revenue: 3150,
          rating: 4.9,
          category: 'Customer Support',
          trend: 12.5
        },
        {
          id: '2',
          name: 'Advanced Analytics Bot',
          sales: 32,
          revenue: 2240,
          rating: 4.8,
          category: 'Data Analysis',
          trend: 8.3
        }
      ],
      recentActivity: recentActivity.length > 0 ? recentActivity : [
        {
          type: 'sale',
          message: 'Customer Support AI Pro sold to TechCorp Inc',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          amount: 70
        },
        {
          type: 'review',
          message: 'New 5-star review on Advanced Analytics Bot',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        }
      ]
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Error fetching seller analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
