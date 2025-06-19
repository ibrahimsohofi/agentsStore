import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { orderId } = params

    // Find the order and verify ownership
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        buyerId: session.user.id,
        status: 'COMPLETED',
        paymentStatus: 'SUCCEEDED'
      },
      include: {
        agent: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or not accessible' },
        { status: 404 }
      )
    }

    // Check download limits
    if (order.downloadCount >= order.maxDownloads) {
      return NextResponse.json(
        { error: 'Maximum downloads exceeded' },
        { status: 403 }
      )
    }

    // Check if order has expired
    if (order.expiresAt && new Date() > order.expiresAt) {
      return NextResponse.json(
        { error: 'Download link has expired' },
        { status: 403 }
      )
    }

    // Generate license key
    const licenseKey = `AGENT-${order.agent.name.replace(/\s+/g, '-').toUpperCase()}-${uuidv4().split('-')[0]}`

    // Update download count
    await prisma.order.update({
      where: { id: orderId },
      data: {
        downloadCount: { increment: 1 }
      }
    })

    // In a real implementation, you would:
    // 1. Generate/fetch the actual agent file
    // 2. Create a secure download URL
    // 3. Log the download for analytics

    // For now, return mock download data
    const downloadData = {
      licenseKey,
      downloadUrl: order.agent.downloadUrl || `https://downloads.agentstore.com/agents/${order.agent.id}`,
      agentName: order.agent.name,
      version: order.agent.version,
      documentation: order.agent.documentation,
      downloadedAt: new Date().toISOString(),
      remainingDownloads: order.maxDownloads - (order.downloadCount + 1),
      expiresAt: order.expiresAt?.toISOString(),
      instructions: {
        setup: [
          'Download the agent file using the secure link above',
          'Import the workflow into your n8n instance',
          'Configure the required API keys and webhooks',
          'Test the agent in a safe environment before production use'
        ],
        requirements: order.agent.requirements ? JSON.parse(order.agent.requirements) : [],
        integrations: order.agent.integrations ? JSON.parse(order.agent.integrations) : []
      }
    }

    return NextResponse.json({
      success: true,
      download: downloadData
    })
  } catch (error) {
    console.error('Error processing download:', error)
    return NextResponse.json(
      { error: 'Failed to process download' },
      { status: 500 }
    )
  }
}
