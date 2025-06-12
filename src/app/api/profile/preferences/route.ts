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

    const preferences = await prisma.userPreferences.findUnique({
      where: {
        userId: session.user.id
      }
    })

    // Parse JSON fields
    const parsedPreferences = preferences ? {
      ...preferences,
      preferredCategories: JSON.parse(preferences.preferredCategories || '[]'),
      priceRange: JSON.parse(preferences.priceRange || '{"min": 0, "max": 1000}'),
      preferredContentType: JSON.parse(preferences.preferredContentType || '[]'),
      interestProfile: preferences.interestProfile ? JSON.parse(preferences.interestProfile) : null,
      behaviorPattern: preferences.behaviorPattern ? JSON.parse(preferences.behaviorPattern) : null,
      recommendationWeights: preferences.recommendationWeights ? JSON.parse(preferences.recommendationWeights) : null
    } : null

    return NextResponse.json({ preferences: parsedPreferences })

  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    const {
      preferredCategories = [],
      priceRange = { min: 0, max: 1000 },
      ratingThreshold = 0,
      theme = 'light',
      language = 'en',
      currency = 'USD',
      itemsPerPage = 12,
      defaultSortBy = 'relevance',
      showFeaturedFirst = true,
      emailNotifications = true,
      pushNotifications = true,
      marketingEmails = false,
      weeklyDigest = true,
      priceDropAlerts = true,
      newAgentAlerts = false,
      showAdultContent = false,
      preferredContentType = [],
      expertise = 'all',
      usageType = 'business',
      interestProfile,
      behaviorPattern,
      recommendationWeights
    } = body

    // Prepare data for database
    const preferencesData = {
      userId: session.user.id,
      preferredCategories: JSON.stringify(preferredCategories),
      priceRange: JSON.stringify(priceRange),
      ratingThreshold,
      theme,
      language,
      currency,
      itemsPerPage,
      defaultSortBy,
      showFeaturedFirst,
      emailNotifications,
      pushNotifications,
      marketingEmails,
      weeklyDigest,
      priceDropAlerts,
      newAgentAlerts,
      showAdultContent,
      preferredContentType: JSON.stringify(preferredContentType),
      expertise,
      usageType,
      interestProfile: interestProfile ? JSON.stringify(interestProfile) : null,
      behaviorPattern: behaviorPattern ? JSON.stringify(behaviorPattern) : null,
      recommendationWeights: recommendationWeights ? JSON.stringify(recommendationWeights) : null
    }

    // Upsert preferences (create or update)
    const preferences = await prisma.userPreferences.upsert({
      where: {
        userId: session.user.id
      },
      update: preferencesData,
      create: preferencesData
    })

    return NextResponse.json({
      success: true,
      preferences,
      message: 'Preferences saved successfully'
    })

  } catch (error) {
    console.error('Error saving user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.userPreferences.deleteMany({
      where: {
        userId: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Preferences reset to defaults'
    })

  } catch (error) {
    console.error('Error resetting user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to reset preferences' },
      { status: 500 }
    )
  }
}
