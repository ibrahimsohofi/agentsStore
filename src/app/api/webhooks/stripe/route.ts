import { type NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { notifyOrderCompleted } from '@/lib/notifications'
import { headers } from 'next/headers'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    console.error('Webhook signature verification failed.', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object)
        break
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, agentIds } = session.metadata

  if (!userId || !agentIds) {
    console.error('Missing metadata in checkout session')
    return
  }

  const parsedAgentIds = JSON.parse(agentIds)

  // Get agents to create orders
  const agents = await prisma.agent.findMany({
    where: {
      id: { in: parsedAgentIds }
    }
  })

  // Create orders for each agent
  for (const agent of agents) {
    await prisma.order.create({
      data: {
        buyerId: userId,
        agentId: agent.id,
        totalAmount: agent.price,
        status: 'COMPLETED',
        paymentStatus: 'SUCCEEDED',
        stripePaymentId: session.payment_intent,
      }
    })

    // Update agent sales stats
    await prisma.agent.update({
      where: { id: agent.id },
      data: {
        totalSales: { increment: 1 },
        totalRevenue: { increment: agent.price }
      }
    })

    // Update seller stats
    await prisma.user.update({
      where: { id: agent.sellerId },
      data: {
        totalSales: { increment: 1 },
        totalRevenue: { increment: agent.price }
      }
    })

    // Create notifications for buyer and seller
    await notifyOrderCompleted(
      userId,
      agent.sellerId,
      agent.name,
      agent.price
    )
  }

  console.log(`Created ${agents.length} orders for user ${userId}`)
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Additional handling for payment success if needed
  console.log('Payment succeeded:', paymentIntent.id)
}
