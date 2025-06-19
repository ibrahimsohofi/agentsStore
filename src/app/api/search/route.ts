import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = Number.parseInt(searchParams.get('limit') || '10')

    if (!query) {
      return NextResponse.json({ agents: [], suggestions: [] })
    }

    // Simple search for agents
    const agents = await prisma.agent.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        rating: true,
        image: true
      },
      take: limit,
      orderBy: [
        { featured: 'desc' },
        { rating: 'desc' },
        { totalSales: 'desc' }
      ]
    })

    // Generate search suggestions
    const suggestions = await generateQuickSuggestions(query)

    return NextResponse.json({
      agents,
      suggestions,
      query
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

async function generateQuickSuggestions(query: string) {
  try {
    const suggestions = []

    // Get popular search terms (mock data for now)
    const popularTerms = [
      'customer support',
      'data analysis',
      'content creation',
      'sales automation',
      'marketing assistant',
      'workflow automation',
      'email management',
      'social media'
    ]

    // Filter suggestions based on query
    const matchingSuggestions = popularTerms.filter(term =>
      term.toLowerCase().includes(query.toLowerCase())
    )

    suggestions.push(...matchingSuggestions.slice(0, 5))

    // Get actual agent names that match
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

    return [...new Set(suggestions)].slice(0, 8) // Remove duplicates and limit
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return []
  }
}
