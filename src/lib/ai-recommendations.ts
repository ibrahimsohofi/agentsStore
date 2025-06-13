import { Matrix } from 'ml-matrix'
import { TfIdf, PorterStemmer, WordTokenizer } from 'natural'
import { prisma } from '@/lib/prisma'

interface UserProfile {
  id: string
  preferences: {
    categories: string[]
    priceRange: { min: number; max: number }
    expertise: string
    usageType: string
  }
  behaviorData: {
    viewedAgents: string[]
    purchasedAgents: string[]
    searchHistory: string[]
    clickPatterns: Array<{ agentId: string; timestamp: Date; duration: number }>
    ratingHistory: Array<{ agentId: string; rating: number }>
  }
}

interface AgentFeatures {
  id: string
  name: string
  description: string
  category: string
  price: number
  rating: number
  tags: string[]
  features: string[]
  popularityScore: number
  qualityScore: number
  textEmbedding: number[]
}

interface RecommendationResult {
  agentId: string
  score: number
  reason: string
  type: 'collaborative' | 'content' | 'hybrid' | 'trending' | 'personalized'
}

export class AIRecommendationEngine {
  private tfidf: TfIdf
  private agentFeatures: Map<string, AgentFeatures>
  private userProfiles: Map<string, UserProfile>
  private collaborativeMatrix: Matrix | null = null

  constructor() {
    this.tfidf = new TfIdf()
    this.agentFeatures = new Map()
    this.userProfiles = new Map()
  }

  async initialize() {
    await this.loadAgentFeatures()
    await this.loadUserProfiles()
    await this.buildCollaborativeFilteringMatrix()
    this.trainContentBasedModel()
  }

  private async loadAgentFeatures() {
    const agents = await prisma.agent.findMany({
      where: { status: 'APPROVED' },
      include: {
        reviews: {
          select: { rating: true }
        },
        orders: {
          where: { status: 'COMPLETED' }
        }
      }
    })

    for (const agent of agents) {
      const features: AgentFeatures = {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        category: agent.category,
        price: agent.price,
        rating: agent.rating,
        tags: JSON.parse(agent.tags || '[]'),
        features: JSON.parse(agent.features || '[]'),
        popularityScore: this.calculatePopularityScore(agent),
        qualityScore: this.calculateQualityScore(agent),
        textEmbedding: await this.generateTextEmbedding(agent)
      }

      this.agentFeatures.set(agent.id, features)
    }
  }

  private async loadUserProfiles() {
    const users = await prisma.user.findMany({
      include: {
        preferences: true,
        orders: {
          include: { agent: true }
        },
        reviews: true,
        searchHistory: true
      }
    })

    for (const user of users) {
      const profile: UserProfile = {
        id: user.id,
        preferences: {
          categories: JSON.parse(user.preferences?.preferredCategories || '[]'),
          priceRange: JSON.parse(user.preferences?.priceRange || '{"min": 0, "max": 1000}'),
          expertise: user.preferences?.expertise || 'all',
          usageType: user.preferences?.usageType || 'business'
        },
        behaviorData: {
          viewedAgents: [], // Would track from analytics
          purchasedAgents: user.orders.map(order => order.agentId),
          searchHistory: user.searchHistory?.map(s => s.query) || [],
          clickPatterns: [], // Would track from frontend events
          ratingHistory: user.reviews.map(review => ({
            agentId: review.agentId,
            rating: review.rating
          }))
        }
      }

      this.userProfiles.set(user.id, profile)
    }
  }

  private async buildCollaborativeFilteringMatrix() {
    const userIds = Array.from(this.userProfiles.keys())
    const agentIds = Array.from(this.agentFeatures.keys())

    // Create user-item matrix for collaborative filtering
    const matrix = new Matrix(userIds.length, agentIds.length)

    for (const [userIndex, userId] of userIds.entries()) {
      const profile = this.userProfiles.get(userId)
      if (!profile) continue

      for (const [agentIndex, agentId] of agentIds.entries()) {
        // Check if user has interacted with this agent
        const rating = profile.behaviorData.ratingHistory.find(r => r.agentId === agentId)?.rating || 0
        const purchased = profile.behaviorData.purchasedAgents.includes(agentId) ? 1 : 0

        // Combine rating and purchase behavior
        const score = rating > 0 ? rating : (purchased * 3) // Give purchased items a base score
        matrix.set(userIndex, agentIndex, score)
      }
    }

    this.collaborativeMatrix = matrix
  }

  private trainContentBasedModel() {
    // Build TF-IDF model for content-based filtering
    for (const agent of this.agentFeatures) {
      const textContent = [
        agent.name,
        agent.description,
        agent.category,
        ...agent.tags,
        ...agent.features
      ].join(' ')

      this.tfidf.addDocument(textContent.toLowerCase())
    }
  }

  private calculatePopularityScore(agent: AgentFeatures & { totalSales: number; reviews?: unknown[] }): number {
    const totalSales = agent.totalSales || 0
    const reviewCount = agent.reviews?.length || 0
    const avgRating = agent.rating || 0

    // Weighted popularity score
    return (totalSales * 0.4) + (reviewCount * 0.3) + (avgRating * 20 * 0.3)
  }

  private calculateQualityScore(agent: AgentFeatures & { reviews?: unknown[]; verified: boolean; featured: boolean }): number {
    const rating = agent.rating || 0
    const reviewCount = agent.reviews?.length || 0
    const verified = agent.verified ? 1 : 0
    const featured = agent.featured ? 1 : 0

    // Quality score with confidence adjustment
    const confidence = Math.min(reviewCount / 10, 1) // Max confidence at 10 reviews
    return (rating * confidence * 0.6) + (verified * 20) + (featured * 10)
  }

  private async generateTextEmbedding(agent: AgentFeatures): Promise<number[]> {
    // Simple TF-IDF based embedding (in production, use OpenAI embeddings)
    const text = `${agent.name} ${agent.description} ${agent.category}`.toLowerCase()
    const tokenizer = new WordTokenizer()
    const tokens = tokenizer.tokenize(text) || []
    const stemmed = tokens.map(token => PorterStemmer.stem(token))

    // Create a simple frequency-based embedding
    const embedding = new Array(100).fill(0)
    stemmed.forEach((token, index) => {
      const hashCode = this.hashCode(token)
      embedding[Math.abs(hashCode) % 100] += 1
    })

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding
  }

  private hashCode(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash
  }

  async getRecommendations(userId: string, limit = 10): Promise<RecommendationResult[]> {
    const userProfile = this.userProfiles.get(userId)
    if (!userProfile) {
      return this.getTrendingRecommendations(limit)
    }

    const recommendations: RecommendationResult[] = []

    // 1. Collaborative Filtering Recommendations
    const collaborativeRecs = await this.getCollaborativeRecommendations(userId, Math.ceil(limit * 0.4))
    recommendations.push(...collaborativeRecs)

    // 2. Content-Based Recommendations
    const contentRecs = await this.getContentBasedRecommendations(userId, Math.ceil(limit * 0.3))
    recommendations.push(...contentRecs)

    // 3. Personalized Recommendations based on preferences
    const personalizedRecs = await this.getPersonalizedRecommendations(userId, Math.ceil(limit * 0.2))
    recommendations.push(...personalizedRecs)

    // 4. Trending/Popular agents to fill remaining slots
    const trendingRecs = await this.getTrendingRecommendations(Math.ceil(limit * 0.1))
    recommendations.push(...trendingRecs)

    // Remove duplicates and sort by score
    const uniqueRecs = this.removeDuplicatesAndSort(recommendations)

    return uniqueRecs.slice(0, limit)
  }

  private async getCollaborativeRecommendations(userId: string, limit: number): Promise<RecommendationResult[]> {
    if (!this.collaborativeMatrix) return []

    const userIds = Array.from(this.userProfiles.keys())
    const agentIds = Array.from(this.agentFeatures.keys())
    const userIndex = userIds.indexOf(userId)

    if (userIndex === -1) return []

    const userVector = this.collaborativeMatrix.getRow(userIndex)
    const recommendations: RecommendationResult[] = []

    // Find similar users using cosine similarity
    const similarities: Array<{ userIndex: number; similarity: number }> = []

    for (let i = 0; i < userIds.length; i++) {
      if (i !== userIndex) {
        const otherUserVector = this.collaborativeMatrix.getRow(i)
        const similarity = this.cosineSimilarity(userVector, otherUserVector)
        similarities.push({ userIndex: i, similarity })
      }
    }

    // Sort by similarity and get top similar users
    similarities.sort((a, b) => b.similarity - a.similarity)
    const topSimilarUsers = similarities.slice(0, 10)

    // Get recommendations from similar users
    const agentScores = new Map<string, number>()

    for (const { userIndex: similarUserIndex, similarity } of topSimilarUsers) {
      const similarUserVector = this.collaborativeMatrix.getRow(similarUserIndex)
      for (let agentIndex = 0; agentIndex < similarUserVector.length; agentIndex++) {
        const score = similarUserVector[agentIndex]
        if (score > 0 && userVector[agentIndex] === 0) { // Not already interacted with
          const agentId = agentIds[agentIndex]
          const currentScore = agentScores.get(agentId) || 0
          agentScores.set(agentId, currentScore + (score * similarity))
        }
      }
    }

    // Convert to recommendations
    const sortedAgentScores = Array.from(agentScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)

    for (const [agentId, score] of sortedAgentScores) {
      recommendations.push({
        agentId,
        score,
        reason: 'Users with similar preferences also liked this agent',
        type: 'collaborative'
      })
    }

    return recommendations
  }

  private async getContentBasedRecommendations(userId: string, limit: number): Promise<RecommendationResult[]> {
    const userProfile = this.userProfiles.get(userId)
    if (!userProfile) return []

    const recommendations: RecommendationResult[] = []

    // Get user's interaction history to build preference profile
    const interactedAgents = userProfile.behaviorData.purchasedAgents
    if (interactedAgents.length === 0) return []

    // Create user preference vector based on liked agents
    const userPreferenceVector = new Array(100).fill(0)
    let totalInteractions = 0

    for (const agentId of interactedAgents) {
      const agent = this.agentFeatures.get(agentId)
      if (agent) {
        for (const [index, value] of agent.textEmbedding.entries()) {
          userPreferenceVector[index] += value
        }
        totalInteractions++
      }
    }

    // Normalize user preference vector
    if (totalInteractions > 0) {
      userPreferenceVector.forEach((_, index) => {
        userPreferenceVector[index] /= totalInteractions
      })
    }

    // Calculate similarity with all agents
    const agentSimilarities: Array<{ agentId: string; similarity: number }> = []

    this.agentFeatures.forEach((agent, agentId) => {
      if (!interactedAgents.includes(agentId)) {
        const similarity = this.cosineSimilarity(userPreferenceVector, agent.textEmbedding)
        agentSimilarities.push({ agentId, similarity })
      }
    })

    // Sort and get top recommendations
    const sortedSimilarities = agentSimilarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)

    for (const { agentId, similarity } of sortedSimilarities) {
      recommendations.push({
        agentId,
        score: similarity * 100,
        reason: 'Similar to agents you have purchased',
        type: 'content'
      })
    }

    return recommendations
  }

  private async getPersonalizedRecommendations(userId: string, limit: number): Promise<RecommendationResult[]> {
    const userProfile = this.userProfiles.get(userId)
    if (!userProfile) return []

    const recommendations: RecommendationResult[] = []

    // Filter agents based on user preferences
    const candidateAgents = Array.from(this.agentFeatures.values()).filter(agent => {
      // Category preference
      const categoryMatch = userProfile.preferences.categories.length === 0 ||
                           userProfile.preferences.categories.includes(agent.category)

      // Price range
      const priceMatch = agent.price >= userProfile.preferences.priceRange.min &&
                        agent.price <= userProfile.preferences.priceRange.max

      // Not already purchased
      const notPurchased = !userProfile.behaviorData.purchasedAgents.includes(agent.id)

      return categoryMatch && priceMatch && notPurchased
    })

    // Score based on user preferences and agent quality
    for (const agent of candidateAgents) {
      let score = agent.qualityScore * 0.4 + agent.popularityScore * 0.3

      // Boost for preferred categories
      if (userProfile.preferences.categories.includes(agent.category)) {
        score += 20
      }

      // Boost for expertise level match
      if (userProfile.preferences.expertise === 'beginner' && agent.rating >= 4.5) {
        score += 15 // Well-rated agents are better for beginners
      }

      recommendations.push({
        agentId: agent.id,
        score,
        reason: 'Matches your preferences and interests',
        type: 'personalized'
      })
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  private async getTrendingRecommendations(limit: number): Promise<RecommendationResult[]> {
    const recommendations: RecommendationResult[] = []

    // Get top agents by popularity and quality
    const trendingAgents = Array.from(this.agentFeatures.values())
      .sort((a, b) => (b.popularityScore + b.qualityScore) - (a.popularityScore + a.qualityScore))
      .slice(0, limit)

    for (const agent of trendingAgents) {
      recommendations.push({
        agentId: agent.id,
        score: agent.popularityScore + agent.qualityScore,
        reason: 'Trending and highly rated',
        type: 'trending'
      })
    }

    return recommendations
  }

  private cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i]
      normA += vectorA[i] * vectorA[i]
      normB += vectorB[i] * vectorB[i]
    }

    if (normA === 0 || normB === 0) return 0

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  private removeDuplicatesAndSort(recommendations: RecommendationResult[]): RecommendationResult[] {
    const seen = new Set<string>()
    const unique: RecommendationResult[] = []

    const sortedRecommendations = recommendations.sort((a, b) => b.score - a.score)

    for (const rec of sortedRecommendations) {
      if (!seen.has(rec.agentId)) {
        seen.add(rec.agentId)
        unique.push(rec)
      }
    }

    return unique
  }

  async updateUserBehavior(userId: string, behaviorData: Partial<UserProfile['behaviorData']>) {
    const userProfile = this.userProfiles.get(userId)
    if (userProfile) {
      Object.assign(userProfile.behaviorData, behaviorData)
      // In production, save to database
    }
  }

  async trainModel() {
    await this.initialize()
  }
}

// Singleton instance
export const recommendationEngine = new AIRecommendationEngine()
