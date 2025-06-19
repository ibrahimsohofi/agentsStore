import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { recommendationEngine } from '@/lib/ai-recommendations'
import { prisma } from '@/lib/prisma'

// Type definitions for user behavior tracking
interface UserBehaviorData {
  agentId: string
  duration?: number
  [key: string]: unknown
}

interface BehaviorUpdate {
  viewedAgents?: string[]
  clickPatterns?: Array<{
    agentId: string
    timestamp: Date
    duration: number
  }>
  purchasedAgents?: string[]
}

interface RecommendationFeedback {
  agentId: string
  type: string
  helpful: boolean
  reason?: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type') || 'all'
    const userId = session?.user?.id

    // Initialize recommendation engine if not already done
    if (!recommendationEngine) {
      await recommendationEngine.initialize()
    }

    let recommendations = []

    if (userId) {
      // Get personalized recommendations for logged-in users
      recommendations = await recommendationEngine.getRecommendations(userId, limit)
    } else {
      // Get trending recommendations for anonymous users
      recommendations = await getTrendingAgentsForAnonymous(limit)
    }

    // Fetch agent details for recommendations
    const agentIds = recommendations.map(rec => rec.agentId)
    const agents = await prisma.agent.findMany({
      where: {
        id: { in: agentIds },
        status: 'APPROVED'
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            verified: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      }
    })

    // Combine recommendations with agent data
    const enrichedRecommendations = recommendations.map(rec => {
      const agent = agents.find(a => a.id === rec.agentId)
      return {
        ...rec,
        agent
      }
    }).filter(rec => rec.agent) // Remove any recommendations where agent wasn't found

    return NextResponse.json({
      recommendations: enrichedRecommendations,
      totalCount: enrichedRecommendations.length,
      userId: userId || null,
      isPersonalized: !!userId
    })

  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'track_view':
        await trackUserBehavior(session.user.id, 'view', data)
        break
      case 'track_click':
        await trackUserBehavior(session.user.id, 'click', data)
        break
      case 'track_purchase':
        await trackUserBehavior(session.user.id, 'purchase', data)
        break
      case 'feedback':
        await handleRecommendationFeedback(session.user.id, data)
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error handling recommendation action:', error)
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    )
  }
}

async function getTrendingAgentsForAnonymous(limit: number) {
  const agents = await prisma.agent.findMany({
    where: { status: 'APPROVED' },
    orderBy: [
      { totalSales: 'desc' },
      { rating: 'desc' },
      { createdAt: 'desc' }
    ],
    take: limit
  })

  return agents.map(agent => ({
    agentId: agent.id,
    score: (agent.totalSales || 0) + (agent.rating * 20),
    reason: 'Popular and highly rated',
    type: 'trending' as const
  }))
}

async function trackUserBehavior(userId: string, action: string, data: UserBehaviorData) {
  // Track user behavior for improving recommendations
  await prisma.userAnalytics.upsert({
    where: {
      userId_date: {
        userId,
        date: new Date().toISOString().split('T')[0]
      }
    },
    update: {
      actions: {
        increment: 1
      },
      lastActivity: new Date()
    },
    create: {
      userId,
      date: new Date().toISOString().split('T')[0],
      actions: 1,
      lastActivity: new Date(),
      data: JSON.stringify({ [action]: data })
    }
  })

  // Update recommendation engine with new behavior
  const behaviorUpdate: BehaviorUpdate = {}

  switch (action) {
    case 'view':
      behaviorUpdate.viewedAgents = [data.agentId]
      break
    case 'click':
      behaviorUpdate.clickPatterns = [{
        agentId: data.agentId,
        timestamp: new Date(),
        duration: data.duration || 0
      }]
      break
    case 'purchase':
      behaviorUpdate.purchasedAgents = [data.agentId]
      break
  }

  await recommendationEngine.updateUserBehavior(userId, behaviorUpdate)
}

async function handleRecommendationFeedback(userId: string, feedback: RecommendationFeedback) {
  // Store feedback for improving recommendations
  await prisma.recommendationFeedback.create({
    data: {
      userId,
      agentId: feedback.agentId,
      recommendationType: feedback.type,
      helpful: feedback.helpful,
      reason: feedback.reason,
      createdAt: new Date()
    }
  })

  // Use feedback to improve future recommendations
  // This could trigger model retraining or weight adjustments
}
