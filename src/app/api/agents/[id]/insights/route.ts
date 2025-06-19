import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Agent, Order, Review } from '@prisma/client'

// Type definitions for agent data with relations
type AgentWithRelations = Agent & {
  orders: Order[]
  reviews: Review[]
}

// Type for metrics passed to optimization function
type AgentMetrics = {
  competitiveAnalysis: {
    positioning: {
      pricePosition: string
    }
  }
}

// Type for competitive analysis
type CompetitiveAnalysis = {
  averagePrice: number
  positioning: {
    pricePosition: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const agentId = params.id
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('range') || '30d'

    // Check if user owns the agent or is admin
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        seller: true,
        reviews: {
          include: {
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        orders: {
          where: { status: 'COMPLETED' },
          include: {
            buyer: {
              select: { name: true, id: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    if (session.user.role !== 'ADMIN' && agent.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

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

    // Generate comprehensive insights
    const insights = await generateAgentInsights(agent, startDate, now)

    return NextResponse.json(insights)

  } catch (error) {
    console.error('Error fetching agent insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    )
  }
}

async function generateAgentInsights(agent: AgentWithRelations, startDate: Date, endDate: Date) {
  // Basic performance metrics
  const recentOrders = agent.orders.filter((order: Order) =>
    new Date(order.createdAt) >= startDate
  )
  const recentReviews = agent.reviews.filter((review: Review) =>
    new Date(review.createdAt) >= startDate
  )

  // Calculate metrics
  const totalRevenue = agent.orders.reduce((sum: number, order: Order) => sum + order.totalAmount, 0)
  const recentRevenue = recentOrders.reduce((sum: number, order: Order) => sum + order.totalAmount, 0)
  const conversionRate = calculateConversionRate(agent)
  const customerSatisfaction = calculateCustomerSatisfaction(agent.reviews)
  const marketPosition = await calculateMarketPosition(agent)

  // Performance trends
  const salesTrend = generateSalesTrend(agent.orders, startDate, endDate)
  const ratingTrend = generateRatingTrend(agent.reviews, startDate, endDate)
  const revenueTrend = generateRevenueTrend(agent.orders, startDate, endDate)

  // Competitive analysis
  const competitiveAnalysis = await generateCompetitiveAnalysis(agent)

  // Optimization recommendations
  const recommendations = generateOptimizationRecommendations(agent, {
    conversionRate,
    customerSatisfaction,
    marketPosition,
    competitiveAnalysis
  })

  // Customer insights
  const customerInsights = generateCustomerInsights(agent.orders, agent.reviews)

  // Performance score calculation
  const performanceScore = calculatePerformanceScore(agent, {
    conversionRate,
    customerSatisfaction,
    marketPosition
  })

  return {
    overview: {
      totalSales: agent.totalSales,
      totalRevenue,
      recentSales: recentOrders.length,
      recentRevenue,
      averageRating: agent.rating,
      totalReviews: agent.reviews.length,
      conversionRate,
      customerSatisfaction,
      performanceScore
    },
    trends: {
      sales: salesTrend,
      rating: ratingTrend,
      revenue: revenueTrend
    },
    marketPosition,
    competitiveAnalysis,
    customerInsights,
    recommendations,
    qualityMetrics: {
      descriptionQuality: analyzeDescriptionQuality(agent),
      pricingStrategy: analyzePricingStrategy(agent, competitiveAnalysis),
      visualPresentation: analyzeVisualPresentation(agent),
      userEngagement: analyzeUserEngagement(agent)
    },
    searchOptimization: {
      keywordRelevance: analyzeKeywordRelevance(agent),
      categoryOptimization: analyzeCategoryOptimization(agent),
      tagEffectiveness: analyzeTagEffectiveness(agent),
      searchRanking: await calculateSearchRanking(agent)
    }
  }
}

function calculateConversionRate(agent: AgentWithRelations) {
  // Simulated view data (in real app, track actual views)
  const estimatedViews = agent.totalSales * (8 + Math.random() * 12) // 8-20x sales as views
  return agent.totalSales > 0 ? (agent.totalSales / estimatedViews) * 100 : 0
}

function calculateCustomerSatisfaction(reviews: Review[]) {
  if (reviews.length === 0) return 0

  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  const satisfiedReviews = reviews.filter(r => r.rating >= 4).length
  const satisfactionRate = (satisfiedReviews / reviews.length) * 100

  return {
    averageRating: avgRating,
    satisfactionRate,
    totalReviews: reviews.length,
    ratingDistribution: {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    }
  }
}

async function calculateMarketPosition(agent: AgentWithRelations) {
  // Get category competitors
  const categoryAgents = await prisma.agent.findMany({
    where: {
      category: agent.category,
      status: 'APPROVED',
      id: { not: agent.id }
    },
    select: {
      totalSales: true,
      rating: true,
      price: true,
      totalRevenue: true
    }
  })

  if (categoryAgents.length === 0) {
    return {
      categoryRank: 1,
      totalInCategory: 1,
      percentileRank: 100,
      competitorComparison: 'No competitors in category'
    }
  }

  // Sort by total revenue for ranking
  const allAgents = [...categoryAgents, {
    totalSales: agent.totalSales,
    rating: agent.rating,
    price: agent.price,
    totalRevenue: agent.totalRevenue
  }].sort((a, b) => b.totalRevenue - a.totalRevenue)

  const rank = allAgents.findIndex(a => a.totalRevenue === agent.totalRevenue) + 1
  const percentileRank = ((allAgents.length - rank + 1) / allAgents.length) * 100

  return {
    categoryRank: rank,
    totalInCategory: allAgents.length,
    percentileRank,
    competitorComparison: rank <= 3 ? 'Top performer' :
                        rank <= allAgents.length * 0.25 ? 'Above average' :
                        rank <= allAgents.length * 0.75 ? 'Average' : 'Below average'
  }
}

async function generateCompetitiveAnalysis(agent: AgentWithRelations) {
  const competitors = await prisma.agent.findMany({
    where: {
      category: agent.category,
      status: 'APPROVED',
      id: { not: agent.id }
    },
    orderBy: { totalRevenue: 'desc' },
    take: 5,
    select: {
      id: true,
      name: true,
      price: true,
      rating: true,
      totalSales: true,
      totalRevenue: true,
      features: true,
      tags: true
    }
  })

  const avgPrice = competitors.reduce((sum, comp) => sum + comp.price, 0) / competitors.length
  const avgRating = competitors.reduce((sum, comp) => sum + comp.rating, 0) / competitors.length
  const avgSales = competitors.reduce((sum, comp) => sum + comp.totalSales, 0) / competitors.length

  return {
    competitors: competitors.map(comp => ({
      ...comp,
      priceAdvantage: agent.price < comp.price ? 'Lower' : agent.price > comp.price ? 'Higher' : 'Same',
      ratingComparison: agent.rating - comp.rating,
      salesComparison: agent.totalSales - comp.totalSales
    })),
    marketAverages: {
      price: avgPrice,
      rating: avgRating,
      sales: avgSales
    },
    positioning: {
      pricePosition: agent.price < avgPrice ? 'Budget-friendly' :
                   agent.price > avgPrice * 1.5 ? 'Premium' : 'Competitive',
      qualityPosition: agent.rating > avgRating ? 'High-quality' : 'Standard',
      popularityPosition: agent.totalSales > avgSales ? 'Popular' : 'Niche'
    }
  }
}

function generateOptimizationRecommendations(agent: AgentWithRelations, metrics: AgentMetrics) {
  const recommendations = []

  // Price optimization
  if (metrics.competitiveAnalysis.positioning.pricePosition === 'Premium' &&
      agent.totalSales < 5) {
    recommendations.push({
      category: 'Pricing',
      priority: 'High',
      suggestion: 'Consider lowering price to match market average for better conversion',
      impact: 'Potential 25-40% increase in sales',
      action: 'Price Adjustment'
    })
  }

  // Quality improvements
  if (metrics.customerSatisfaction.averageRating < 4.0) {
    recommendations.push({
      category: 'Quality',
      priority: 'High',
      suggestion: 'Improve agent quality based on customer feedback',
      impact: 'Better ratings will improve search ranking',
      action: 'Quality Enhancement'
    })
  }

  // Description optimization
  if (agent.description.length < 200) {
    recommendations.push({
      category: 'Content',
      priority: 'Medium',
      suggestion: 'Expand agent description with more details and use cases',
      impact: 'Better search visibility and conversion',
      action: 'Content Improvement'
    })
  }

  // Visual improvements
  if (!agent.image) {
    recommendations.push({
      category: 'Visual',
      priority: 'Medium',
      suggestion: 'Add preview images or screenshots to showcase your agent',
      impact: '15-25% improvement in click-through rate',
      action: 'Add Images'
    })
  }

  // Marketing recommendations
  if (agent.totalSales > 0 && agent.reviews.length < agent.totalSales * 0.3) {
    recommendations.push({
      category: 'Marketing',
      priority: 'Low',
      suggestion: 'Encourage customers to leave reviews to build social proof',
      impact: 'Improved conversion rate and search ranking',
      action: 'Review Campaign'
    })
  }

  return recommendations
}

function generateCustomerInsights(orders: Order[], reviews: Review[]) {
  // Analyze customer behavior patterns
  const customerTypes = orders.reduce((acc: Record<string, number>, order) => {
    const buyerId = order.buyer.id
    acc[buyerId] = (acc[buyerId] || 0) + 1
    return acc
  }, {})

  const repeatCustomers = Object.values(customerTypes).filter((count: number) => count > 1).length
  const repeatRate = orders.length > 0 ? (repeatCustomers / Object.keys(customerTypes).length) * 100 : 0

  // Recent customer feedback themes
  const recentReviews = reviews.slice(0, 10)
  const positiveKeywords = ['great', 'excellent', 'amazing', 'perfect', 'helpful', 'useful']
  const negativeKeywords = ['slow', 'confusing', 'difficult', 'expensive', 'buggy', 'poor']

  const sentiment = recentReviews.reduce((acc, review) => {
    const comment = review.comment.toLowerCase()
    const positive = positiveKeywords.some(word => comment.includes(word))
    const negative = negativeKeywords.some(word => comment.includes(word))

    if (positive && !negative) acc.positive++
    else if (negative && !positive) acc.negative++
    else acc.neutral++

    return acc
  }, { positive: 0, negative: 0, neutral: 0 })

  return {
    totalCustomers: Object.keys(customerTypes).length,
    repeatCustomers,
    repeatRate,
    averageOrderValue: orders.length > 0 ?
      orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length : 0,
    customerSentiment: sentiment,
    topCustomers: Object.entries(customerTypes)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([customerId, orderCount]) => ({
        customerId,
        orderCount,
        customer: orders.find(o => o.buyer.id === customerId)?.buyer
      }))
  }
}

function calculatePerformanceScore(agent: AgentWithRelations, metrics: AgentMetrics) {
  let score = 0

  // Sales performance (30%)
  const salesScore = Math.min((agent.totalSales / 50) * 30, 30)
  score += salesScore

  // Rating quality (25%)
  const ratingScore = (agent.rating / 5) * 25
  score += ratingScore

  // Conversion rate (20%)
  const conversionScore = Math.min((metrics.conversionRate / 15) * 20, 20)
  score += conversionScore

  // Customer satisfaction (15%)
  const satisfactionScore = (metrics.customerSatisfaction.satisfactionRate / 100) * 15
  score += satisfactionScore

  // Market position (10%)
  const positionScore = (metrics.marketPosition.percentileRank / 100) * 10
  score += positionScore

  return Math.round(score)
}

// Analysis helper functions
function analyzeDescriptionQuality(agent: AgentWithRelations) {
  const description = `${agent.description} ${agent.longDescription || ''}`
  return {
    length: description.length,
    readability: description.length > 100 ? 'Good' : 'Needs improvement',
    keywords: extractKeywords(description),
    completeness: calculateDescriptionCompleteness(agent)
  }
}

function analyzePricingStrategy(agent: AgentWithRelations, competitive: CompetitiveAnalysis) {
  return {
    currentPrice: agent.price,
    marketAverage: competitive.marketAverages.price,
    pricePosition: competitive.positioning.pricePosition,
    recommendedRange: {
      min: Math.max(1, competitive.marketAverages.price * 0.8),
      max: competitive.marketAverages.price * 1.2
    }
  }
}

function analyzeVisualPresentation(agent: AgentWithRelations) {
  return {
    hasImage: !!agent.image,
    hasPreview: !!agent.preview,
    imageQuality: agent.image ? 'Present' : 'Missing',
    visualScore: (agent.image ? 50 : 0) + (agent.preview ? 50 : 0)
  }
}

function analyzeUserEngagement(agent: AgentWithRelations) {
  const engagementRate = agent.reviews.length / Math.max(agent.totalSales, 1)
  return {
    reviewRate: engagementRate * 100,
    engagementLevel: engagementRate > 0.5 ? 'High' : engagementRate > 0.2 ? 'Medium' : 'Low',
    lastActivity: agent.reviews.length > 0 ? agent.reviews[0].createdAt : null
  }
}

function analyzeKeywordRelevance(agent: AgentWithRelations) {
  const text = `${agent.name} ${agent.description} ${agent.category}`.toLowerCase()
  const keywords = extractKeywords(text)
  return {
    primaryKeywords: keywords.slice(0, 5),
    keywordDensity: keywords.length / text.split(' ').length,
    relevanceScore: Math.min(keywords.length * 10, 100)
  }
}

function analyzeCategoryOptimization(agent: AgentWithRelations) {
  return {
    currentCategory: agent.category,
    categoryFit: 'Good', // Would need ML analysis for real scoring
    suggestedCategories: [], // Would come from ML analysis
    categoryCompetition: 'Medium'
  }
}

function analyzeTagEffectiveness(agent: AgentWithRelations) {
  try {
    const tags = JSON.parse(agent.tags || '[]')
    return {
      tagCount: tags.length,
      effectiveness: tags.length >= 3 ? 'Good' : 'Needs more tags',
      suggestedTags: generateSuggestedTags(agent),
      currentTags: tags
    }
  } catch {
    return { tagCount: 0, effectiveness: 'No tags', suggestedTags: [], currentTags: [] }
  }
}

async function calculateSearchRanking(agent: AgentWithRelations) {
  // Simulate search ranking calculation
  const categoryAgents = await prisma.agent.count({
    where: { category: agent.category, status: 'APPROVED' }
  })

  const betterAgents = await prisma.agent.count({
    where: {
      category: agent.category,
      status: 'APPROVED',
      OR: [
        { rating: { gt: agent.rating } },
        { AND: [{ rating: agent.rating }, { totalSales: { gt: agent.totalSales } }] }
      ]
    }
  })

  return {
    categoryRank: betterAgents + 1,
    totalInCategory: categoryAgents,
    rankingFactors: {
      rating: agent.rating,
      sales: agent.totalSales,
      verified: agent.verified,
      featured: agent.featured
    }
  }
}

// Helper functions
function extractKeywords(text: string) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || []
  const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'])
  return [...new Set(words.filter(word => word.length > 3 && !stopWords.has(word)))]
}

function calculateDescriptionCompleteness(agent: AgentWithRelations) {
  let score = 0
  if (agent.description && agent.description.length > 50) score += 25
  if (agent.longDescription && agent.longDescription.length > 200) score += 25
  if (agent.features && JSON.parse(agent.features || '[]').length > 0) score += 25
  if (agent.requirements && JSON.parse(agent.requirements || '[]').length > 0) score += 25
  return score
}

function generateSuggestedTags(agent: AgentWithRelations) {
  const categoryTags = {
    'Customer Support': ['support', 'helpdesk', 'chat', 'tickets', 'automation'],
    'Data Analysis': ['analytics', 'data', 'reporting', 'insights', 'visualization'],
    'Content Creation': ['content', 'writing', 'copywriting', 'social', 'marketing'],
    'Sales Automation': ['sales', 'crm', 'leads', 'pipeline', 'conversion'],
    'Marketing': ['marketing', 'campaigns', 'email', 'social', 'advertising']
  }

  return categoryTags[agent.category as keyof typeof categoryTags] || ['automation', 'workflow', 'productivity']
}

function generateSalesTrend(orders: Order[], startDate: Date, endDate: Date) {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const trend = []

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const nextDate = new Date(date)
    nextDate.setDate(date.getDate() + 1)

    const dailySales = orders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= date && orderDate < nextDate
    }).length

    trend.push({
      date: date.toISOString().split('T')[0],
      sales: dailySales
    })
  }

  return trend
}

function generateRatingTrend(reviews: Review[], startDate: Date, endDate: Date) {
  const trend = []
  let cumulativeRating = 0
  let reviewCount = 0

  reviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  for (const review of reviews) {
    if (new Date(review.createdAt) >= startDate) {
      reviewCount++
      cumulativeRating += review.rating
      trend.push({
        date: new Date(review.createdAt).toISOString().split('T')[0],
        averageRating: cumulativeRating / reviewCount
      })
    }
  }

  return trend
}

function generateRevenueTrend(orders: Order[], startDate: Date, endDate: Date) {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const trend = []

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const nextDate = new Date(date)
    nextDate.setDate(date.getDate() + 1)

    const dailyRevenue = orders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= date && orderDate < nextDate
    }).reduce((sum, order) => sum + order.totalAmount, 0)

    trend.push({
      date: date.toISOString().split('T')[0],
      revenue: dailyRevenue
    })
  }

  return trend
}
