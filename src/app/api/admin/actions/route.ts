import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyAgentApproved, notifyAgentRejected } from '@/lib/notifications'
import type { AdminActionResult } from '@/types/admin'
import type { AdminActionType, NotificationType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, targetType, targetId, reason, details } = await request.json()

    // Validate action type
    const validActions = [
      'APPROVE_AGENT', 'REJECT_AGENT', 'SUSPEND_USER', 'ACTIVATE_USER',
      'REMOVE_AGENT', 'FEATURE_AGENT', 'UNFEATURE_AGENT', 'REFUND_ORDER',
      'DELETE_REVIEW', 'SEND_WARNING'
    ]

    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action type' }, { status: 400 })
    }

    // Execute the action
    let result: AdminActionResult
    switch (action) {
      case 'APPROVE_AGENT':
        result = await approveAgent(targetId, session.user.id, reason)
        break
      case 'REJECT_AGENT':
        result = await rejectAgent(targetId, session.user.id, reason)
        break
      case 'SUSPEND_USER':
        result = await suspendUser(targetId, session.user.id, reason)
        break
      case 'ACTIVATE_USER':
        result = await activateUser(targetId, session.user.id, reason)
        break
      case 'REMOVE_AGENT':
        result = await removeAgent(targetId, session.user.id, reason)
        break
      case 'FEATURE_AGENT':
        result = await featureAgent(targetId, session.user.id, reason)
        break
      case 'UNFEATURE_AGENT':
        result = await unfeatureAgent(targetId, session.user.id, reason)
        break
      case 'REFUND_ORDER':
        result = await refundOrder(targetId, session.user.id, reason)
        break
      case 'DELETE_REVIEW':
        result = await deleteReview(targetId, session.user.id, reason)
        break
      case 'SEND_WARNING':
        result = await sendWarning(targetId, session.user.id, reason, details)
        break
      default:
        return NextResponse.json({ error: 'Action not implemented' }, { status: 400 })
    }

    // Log the admin action
    await prisma.adminAction.create({
      data: {
        adminId: session.user.id,
        action: action as AdminActionType,
        targetType,
        targetId,
        reason,
        details: details ? JSON.stringify(details) : null
      }
    })

    return NextResponse.json({ success: true, result })

  } catch (error) {
    console.error('Error executing admin action:', error)
    return NextResponse.json(
      { error: 'Failed to execute action' },
      { status: 500 }
    )
  }
}

// Get admin action history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get('page') || '1')
    const limit = Number.parseInt(searchParams.get('limit') || '20')
    const targetType = searchParams.get('targetType')
    const action = searchParams.get('action')

    const where: Record<string, string> = {}
    if (targetType) where.targetType = targetType
    if (action) where.action = action

    const actions = await prisma.adminAction.findMany({
      where,
      include: {
        admin: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.adminAction.count({ where })

    return NextResponse.json({
      actions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching admin actions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch actions' },
      { status: 500 }
    )
  }
}

// Admin action implementations
async function approveAgent(agentId: string, adminId: string, reason?: string) {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: { seller: true }
  })

  if (!agent) throw new Error('Agent not found')

  await prisma.agent.update({
    where: { id: agentId },
    data: {
      status: 'APPROVED',
      verified: true
    }
  })

  // Notify seller
  await createNotification(
    agent.sellerId,
    'AGENT_APPROVED',
    'Agent Approved',
    `Your agent "${agent.name}" has been approved by an administrator.${reason ? ` Reason: ${reason}` : ''}`
  )

  return { message: 'Agent approved successfully' }
}

async function rejectAgent(agentId: string, adminId: string, reason?: string) {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: { seller: true }
  })

  if (!agent) throw new Error('Agent not found')

  await prisma.agent.update({
    where: { id: agentId },
    data: {
      status: 'REJECTED',
      verified: false
    }
  })

  // Notify seller
  await createNotification(
    agent.sellerId,
    'AGENT_REJECTED',
    'Agent Rejected',
    `Your agent "${agent.name}" has been rejected.${reason ? ` Reason: ${reason}` : ''}`
  )

  return { message: 'Agent rejected successfully' }
}

async function suspendUser(userId: string, adminId: string, reason?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) throw new Error('User not found')

  await prisma.user.update({
    where: { id: userId },
    data: { verified: false }
  })

  // Archive user's agents
  await prisma.agent.updateMany({
    where: { sellerId: userId },
    data: { status: 'ARCHIVED' }
  })

  // Notify user
  await createNotification(
    userId,
    'SYSTEM_ALERT',
    'Account Suspended',
    `Your account has been suspended by an administrator.${reason ? ` Reason: ${reason}` : ''}`
  )

  return { message: 'User suspended successfully' }
}

async function activateUser(userId: string, adminId: string, reason?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) throw new Error('User not found')

  await prisma.user.update({
    where: { id: userId },
    data: { verified: true }
  })

  // Notify user
  await createNotification(
    userId,
    'SYSTEM_ALERT',
    'Account Activated',
    `Your account has been activated by an administrator.${reason ? ` Reason: ${reason}` : ''}`
  )

  return { message: 'User activated successfully' }
}

async function removeAgent(agentId: string, adminId: string, reason?: string) {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: { seller: true }
  })

  if (!agent) throw new Error('Agent not found')

  await prisma.agent.update({
    where: { id: agentId },
    data: { status: 'ARCHIVED' }
  })

  // Notify seller
  await createNotification(
    agent.sellerId,
    'SYSTEM_ALERT',
    'Agent Removed',
    `Your agent "${agent.name}" has been removed from the marketplace.${reason ? ` Reason: ${reason}` : ''}`
  )

  return { message: 'Agent removed successfully' }
}

async function featureAgent(agentId: string, adminId: string, reason?: string) {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: { seller: true }
  })

  if (!agent) throw new Error('Agent not found')

  await prisma.agent.update({
    where: { id: agentId },
    data: { featured: true }
  })

  // Notify seller
  await createNotification(
    agent.sellerId,
    'SYSTEM_ALERT',
    'Agent Featured',
    `Your agent "${agent.name}" has been featured on the marketplace!`
  )

  return { message: 'Agent featured successfully' }
}

async function unfeatureAgent(agentId: string, adminId: string, reason?: string) {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: { seller: true }
  })

  if (!agent) throw new Error('Agent not found')

  await prisma.agent.update({
    where: { id: agentId },
    data: { featured: false }
  })

  return { message: 'Agent unfeatured successfully' }
}

async function refundOrder(orderId: string, adminId: string, reason?: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { buyer: true, agent: true }
  })

  if (!order) throw new Error('Order not found')

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'REFUNDED',
      paymentStatus: 'REFUNDED'
    }
  })

  // Notify buyer
  await createNotification(
    order.buyerId,
    'PAYMENT_SUCCESS',
    'Refund Processed',
    `Your order for "${order.agent.name}" has been refunded.${reason ? ` Reason: ${reason}` : ''}`
  )

  return { message: 'Order refunded successfully' }
}

async function deleteReview(reviewId: string, adminId: string, reason?: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { user: true, agent: true }
  })

  if (!review) throw new Error('Review not found')

  await prisma.review.delete({
    where: { id: reviewId }
  })

  // Notify review author
  await createNotification(
    review.userId,
    'SYSTEM_ALERT',
    'Review Removed',
    `Your review for "${review.agent.name}" has been removed.${reason ? ` Reason: ${reason}` : ''}`
  )

  return { message: 'Review deleted successfully' }
}

async function sendWarning(userId: string, adminId: string, reason?: string, details?: Record<string, unknown>): Promise<AdminActionResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) throw new Error('User not found')

  await createNotification(
    userId,
    'ADMIN_MESSAGE',
    'Warning from Administrator',
    reason || 'You have received a warning from the platform administrators.',
    details
  )

  return { success: true, message: 'Warning sent successfully' }
}

async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: Record<string, unknown>
) {
  return await prisma.notification.create({
    data: {
      userId,
      type: type as NotificationType,
      title,
      message,
      data: data ? JSON.stringify(data) : null
    }
  })
}
