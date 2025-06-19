import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

// Type definitions for search functionality
type OrderWithAgent = Prisma.OrderGetPayload<{
  include: { agent: true }
}>

interface UserProfile {
  preferredCategories: string[]
  avgPrice: number
  preferredTags: string[]
  totalPurchases: number
}

interface AgentWithRelations extends Prisma.AgentGetPayload<{
  include: {
    seller: true
    reviews: true
    _count: { select: { reviews: true } }
  }
}> {}

interface RecommendationItem {
  id: string
  name: string
  category: string
  price: number
  rating: number
  [key: string]: unknown
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)

    const query = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minRating = searchParams.get('minRating')
    const sortBy = searchParams.get('sortBy') || 'relevance'
    const featured = searchParams.get('featured') === 'true'
    const verified = searchParams.get('verified') === 'true'
    const trending = searchParams.get('trending') === 'true'
    const page = Number.parseInt(searchParams.get('page') || '1')
    const limit = Number.parseInt(searchParams.get('limit') || '20')
    const userId = session?.user?.id

    // Build search criteria
    const where: Prisma.AgentWhereInput = {
      status: 'APPROVED'
    }

    // Category filter
    if (category) {
      where.category = category
    }

    // Price filters
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = Number.parseFloat(minPrice)
      if (maxPrice) where.price.lte = Number.parseFloat(maxPrice)
    }

    // Rating filter
    if (minRating) {
      where.rating = { gte: Number.parseFloat(minRating) }
    }

    // Featured filter
    if (featured) {
      where.featured = true
    }

    // Verified filter
    if (verified) {
      where.verified = true
    }

    // Text search
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { longDescription: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } }
      ]
    }

    // Determine sort order
    let orderBy: Prisma.AgentOrderByWithRelationInput | Prisma.AgentOrderByWithRelationInput[] = {}
    switch (sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'rating':
        orderBy = { rating: 'desc' }
        break
      case 'sales':
        orderBy = { totalSales: 'desc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      default:
        // For relevance, we'll use a combination of factors
        orderBy = [
          { featured: 'desc' },
          { verified: 'desc' },
          { rating: 'desc' },
          { totalSales: 'desc' }
        ]
        break
    }

    // Get agents with enhanced data
    const agents = await prisma.agent.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            verified: true,
            rating: true
          }
        },
        reviews: {
          select: {
            rating: true,
            createdAt: true
          },
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            reviews: true,
            orders: true
          }
        }
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    })

    // Get total count for pagination
    const total = await prisma.agent.count({ where })

    // Handle trending requests
    if (trending) {
      const trendingAgents = await prisma.agent.findMany({
        where: { status: 'APPROVED' },
        orderBy: [
          { totalSales: 'desc' },
          { rating: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit,
        select: {
          id: true,
          name: true,
          category: true,
          price: true,
          rating: true,
          image: true,
          description: true,
          totalSales: true,
          featured: true
        }
      })

      return NextResponse.json({
        agents: [],
        recommendations: [],
        trending: trendingAgents,
        total: 0,
        suggestions: []
      })
    }

    // Get user's search history and preferences for recommendations
    let recommendations = []
    if (userId) {
      recommendations = await generateRecommendations(userId, query, category)
    }

    // Get popular searches and trending agents
    const trendingAgents = await prisma.agent.findMany({
      where: { status: 'APPROVED' },
      orderBy: [
        { totalSales: 'desc' },
        { rating: 'desc' }
      ],
      take: 5,
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        rating: true,
        image: true
      }
    })

    // Get search suggestions based on query
    const suggestions = query ? await generateSearchSuggestions(query) : []

    // Enhanced results with AI scoring
    const enhancedAgents = agents.map(agent => ({
      ...agent,
      relevanceScore: calculateRelevanceScore(agent, query, userId),
      popularityScore: calculatePopularityScore(agent),
      qualityScore: calculateQualityScore(agent),
      trending: agent.totalSales > 10 && agent.rating > 4.5
    }))

    // Sort by relevance if that's the selected sort
    if (sortBy === 'relevance') {
      enhancedAgents.sort((a, b) => b.relevanceScore - a.relevanceScore)
    }

    return NextResponse.json({
      agents: enhancedAgents,
      recommendations,
      trending: trendingAgents,
      suggestions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        categories: await getAvailableCategories(),
        priceRange: await getPriceRange(),
        ratingRange: { min: 0, max: 5 }
      },
      searchMeta: {
        query,
        resultsCount: total,
        searchTime: Date.now() // In a real app, measure actual search time
      }
    })

  } catch (error) {
    console.error('Error in advanced search:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

// Generate AI-powered recommendations based on user behavior
async function generateRecommendations(userId: string, query: string, category?: string) {
  try {
    // Get user's purchase history and preferences
    const userOrders = await prisma.order.findMany({
      where: {
        buyerId: userId,
        status: 'COMPLETED'
      },
      include: {
        agent: {
          select: {
            id: true,
            category: true,
            tags: true,
            price: true,
            name: true,
            description: true
          }
        }
      },
      take: 50,
      orderBy: { createdAt: 'desc' }
    })

    // Analyze user behavior patterns
    const userProfile = analyzeUserProfile(userOrders)

    // Get content-based recommendations
    const contentRecommendations = await getContentBasedRecommendations(userProfile, query, category, userId)

    // Get collaborative filtering recommendations
    const collaborativeRecommendations = await getCollaborativeRecommendations(userId, userProfile)

    // Get trending agents in user's preferred categories
    const trendingRecommendations = await getTrendingRecommendations(userProfile.preferredCategories)

    // Combine and score recommendations
    const allRecommendations = [
      ...contentRecommendations.map(r => ({ ...r, source: 'content', score: calculateRelevanceScore(r, userProfile, query) })),
      ...collaborativeRecommendations.map(r => ({ ...r, source: 'collaborative', score: calculateRelevanceScore(r, userProfile, query) })),
      ...trendingRecommendations.map(r => ({ ...r, source: 'trending', score: calculateRelevanceScore(r, userProfile, query) }))
    ]

    // Remove duplicates and sort by score
    const uniqueRecommendations = removeDuplicateRecommendations(allRecommendations)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)

    return uniqueRecommendations

  } catch (error) {
    console.error('Error generating recommendations:', error)
    return []
  }
}

// Analyze user profile based on purchase history
function analyzeUserProfile(userOrders: OrderWithAgent[]): UserProfile {
  const categoryFreq: Record<string, number> = {}
  const priceRanges: number[] = []
  const tagFreq: Record<string, number> = {}

  for (const order of userOrders) {
    const agent = order.agent

    // Count categories
    categoryFreq[agent.category] = (categoryFreq[agent.category] || 0) + 1

    // Track price preferences
    priceRanges.push(agent.price)

    // Count tag preferences
    try {
      const tags = JSON.parse(agent.tags || '[]')
      for (const tag of tags) {
        tagFreq[tag] = (tagFreq[tag] || 0) + 1
      }
    } catch (e) {
      // Handle invalid JSON
    }
  }

  const preferredCategories = Object.keys(categoryFreq)
    .sort((a, b) => categoryFreq[b] - categoryFreq[a])
    .slice(0, 3)

  const avgPrice = priceRanges.length > 0 ? priceRanges.reduce((a, b) => a + b, 0) / priceRanges.length : 50
  const preferredTags = Object.keys(tagFreq)
    .sort((a, b) => tagFreq[b] - tagFreq[a])
    .slice(0, 5)

  return {
    preferredCategories,
    avgPrice,
    preferredTags,
    totalPurchases: userOrders.length
  }
}

// Get content-based recommendations
async function getContentBasedRecommendations(userProfile: UserProfile, query: string, category?: string, userId?: string) {
  const whereCondition: Prisma.AgentWhereInput = {
    status: 'APPROVED',
    NOT: userId ? {
      orders: {
        some: { buyerId: userId }
      }
    } : undefined
  }

  if (category) {
    whereCondition.category = category
  } else if (userProfile.preferredCategories.length > 0) {
    whereCondition.category = {
      in: userProfile.preferredCategories
    }
  }

  // Price range filtering based on user preferences
  if (userProfile.avgPrice) {
    whereCondition.price = {
      gte: Math.max(1, userProfile.avgPrice * 0.5),
      lte: userProfile.avgPrice * 2
    }
  }

  // Text search if query provided
  if (query) {
    whereCondition.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { longDescription: { contains: query, mode: 'insensitive' } }
    ]
  }

  return await prisma.agent.findMany({
    where: whereCondition,
    select: {
      id: true,
      name: true,
      category: true,
      price: true,
      rating: true,
      image: true,
      description: true,
      tags: true,
      featured: true,
      totalSales: true
    },
    orderBy: [
      { rating: 'desc' },
      { totalSales: 'desc' }
    ],
    take: 10
  })
}

// Get collaborative filtering recommendations (users who bought similar items)
async function getCollaborativeRecommendations(userId: string, userProfile: UserProfile) {
  try {
    // Find users with similar purchase patterns
    const similarUsers = await prisma.user.findMany({
      where: {
        NOT: { id: userId },
        orders: {
          some: {
            agent: {
              category: {
                in: userProfile.preferredCategories
              }
            }
          }
        }
      },
      include: {
        orders: {
          where: { status: 'COMPLETED' },
          include: {
            agent: {
              select: {
                id: true,
                category: true,
                rating: true,
                totalSales: true
              }
            }
          },
          take: 20
        }
      },
      take: 10
    })

    // Find agents that similar users bought but current user hasn't
    const recommendedAgentIds = new Set<string>()

    for (const user of similarUsers) {
      for (const order of user.orders) {
        if (userProfile.preferredCategories.includes(order.agent.category)) {
          recommendedAgentIds.add(order.agent.id)
        }
      }
    }

    if (recommendedAgentIds.size === 0) return []

    return await prisma.agent.findMany({
      where: {
        id: { in: Array.from(recommendedAgentIds) },
        status: 'APPROVED',
        NOT: {
          orders: {
            some: { buyerId: userId }
          }
        }
      },
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        rating: true,
        image: true,
        description: true,
        totalSales: true
      },
      take: 5
    })

  } catch (error) {
    console.error('Error in collaborative recommendations:', error)
    return []
  }
}

// Get trending recommendations in user's preferred categories
async function getTrendingRecommendations(preferredCategories: string[]) {
  const categories = preferredCategories.length > 0 ? preferredCategories : ['Customer Support', 'Data Analysis', 'Content Creation']

  return await prisma.agent.findMany({
    where: {
      status: 'APPROVED',
      category: {
        in: categories
      },
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    },
    select: {
      id: true,
      name: true,
      category: true,
      price: true,
      rating: true,
      image: true,
      description: true,
      totalSales: true,
      featured: true
    },
    orderBy: [
      { totalSales: 'desc' },
      { rating: 'desc' },
      { createdAt: 'desc' }
    ],
    take: 5
  })
}

// Calculate relevance score for recommendations
function calculateRecommendationScore(agent: AgentWithRelations, userProfile: UserProfile, query?: string): number {
  let score = 0

  // Category preference score (0-30 points)
  if (userProfile.preferredCategories.includes(agent.category)) {
    const categoryIndex = userProfile.preferredCategories.indexOf(agent.category)
    score += 30 - (categoryIndex * 5) // Top category gets 30, second gets 25, etc.
  }

  // Rating score (0-25 points)
  score += (agent.rating || 0) * 5

  // Popularity score (0-20 points)
  const salesScore = Math.min(20, (agent.totalSales || 0) / 10)
  score += salesScore

  // Featured bonus (0-10 points)
  if (agent.featured) {
    score += 10
  }

  // Price preference score (0-15 points)
  if (userProfile.avgPrice && agent.price) {
    const priceDiff = Math.abs(agent.price - userProfile.avgPrice) / userProfile.avgPrice
    score += Math.max(0, 15 - (priceDiff * 15))
  }

  // Query relevance score (0-20 points)
  if (query) {
    const queryLower = query.toLowerCase()
    const nameMatch = agent.name?.toLowerCase().includes(queryLower)
    const descMatch = agent.description?.toLowerCase().includes(queryLower)

    if (nameMatch) score += 15
    if (descMatch) score += 10
  }

  return Math.round(score)
}

// Remove duplicate recommendations
function removeDuplicateRecommendations(recommendations: RecommendationItem[]): RecommendationItem[] {
  const seen = new Set()
  return recommendations.filter(rec => {
    if (seen.has(rec.id)) return false
    seen.add(rec.id)
    return true
  })
}

// Generate search suggestions based on query
async function generateSearchSuggestions(query: string) {
  try {
    const suggestions = []

    // Get matching agent names
    const agentSuggestions = await prisma.agent.findMany({
      where: {
        status: 'APPROVED',
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: { name: true },
      take: 3
    })

    suggestions.push(...agentSuggestions.map(a => a.name))

    // Get matching categories
    const categorySuggestions = await prisma.agent.findMany({
      where: {
        status: 'APPROVED',
        category: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: { category: true },
      distinct: ['category'],
      take: 2
    })

    suggestions.push(...categorySuggestions.map(c => c.category))

    // Add some common suggestions
    const commonSuggestions = [
      'automation', 'customer support', 'data analysis',
      'content creation', 'sales', 'marketing', 'workflow'
    ].filter(s => s.toLowerCase().includes(query.toLowerCase()))

    suggestions.push(...commonSuggestions)

    return [...new Set(suggestions)].slice(0, 5)

  } catch (error) {
    console.error('Error generating suggestions:', error)
    return []
  }
}

// Calculate relevance score for search results
function calculateRelevanceScore(agent: AgentWithRelations, query: string, userId?: string) {
  let score = 0

  if (!query) return score

  const searchTerms = query.toLowerCase().split(' ')

  // Name match (highest weight)
  for (const term of searchTerms) {
    if (agent.name.toLowerCase().includes(term)) {
      score += 50
    }
  }

  // Description match
  for (const term of searchTerms) {
    if (agent.description.toLowerCase().includes(term)) {
      score += 30
    }
  }

  // Category match
  for (const term of searchTerms) {
    if (agent.category.toLowerCase().includes(term)) {
      score += 40
    }
  }

  // Tags match
  try {
    const tags = JSON.parse(agent.tags || '[]')
    for (const term of searchTerms) {
      for (const tag of tags) {
        if (tag.toLowerCase().includes(term)) {
          score += 25
        }
      }
    }
  } catch (e) {
    // Ignore JSON parse errors
  }

  // Boost for quality indicators
  if (agent.verified) score += 10
  if (agent.featured) score += 15
  if (agent.rating > 4.5) score += 5

  return score
}

function calculatePopularityScore(agent: AgentWithRelations) {
  return (agent.totalSales * 0.7) + (agent.rating * 20) + (agent._count.reviews * 0.5)
}

function calculateQualityScore(agent: AgentWithRelations) {
  let score = agent.rating * 20 // Base rating score

  if (agent.verified) score += 10
  if (agent.seller.verified) score += 5
  if (agent._count.reviews > 10) score += 5
  if (agent.seller.rating > 4.0) score += 5

  return Math.min(score, 100) // Cap at 100
}

async function getAvailableCategories() {
  const categories = await prisma.agent.findMany({
    where: { status: 'APPROVED' },
    select: { category: true },
    distinct: ['category']
  })

  return categories.map(c => c.category)
}

async function getPriceRange() {
  const result = await prisma.agent.aggregate({
    where: { status: 'APPROVED' },
    _min: { price: true },
    _max: { price: true }
  })

  return {
    min: result._min.price || 0,
    max: result._max.price || 1000
  }
}
