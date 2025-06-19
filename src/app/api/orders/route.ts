import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    // Build where clause based on filters
    const where: Prisma.OrderWhereInput = {
      buyerId: session.user.id
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        agent: {
          include: {
            seller: {
              select: {
                name: true,
                id: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the frontend expectations
    const transformedOrders = orders.map(order => ({
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt.toISOString(),
      downloadCount: order.downloadCount,
      maxDownloads: order.maxDownloads,
      expiresAt: order.expiresAt?.toISOString(),
      agent: {
        id: order.agent.id,
        name: order.agent.name,
        image: order.agent.image || '/placeholder-agent.png',
        seller: order.agent.seller.name || 'Unknown Seller',
        sellerId: order.agent.seller.id
      }
    }))

    return NextResponse.json({
      orders: transformedOrders,
      total: transformedOrders.length
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
