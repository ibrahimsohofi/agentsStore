import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

interface CartItem {
  agentId: string;
  quantity?: number;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to checkout' },
        { status: 401 }
      )
    }

    const { items } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      )
    }

    // Verify agents exist and get current prices
    const agentIds = (items as CartItem[]).map((item) => item.agentId)
    const agents = await prisma.agent.findMany({
      where: {
        id: { in: agentIds },
        status: 'APPROVED'
      }
    })

    if (agents.length !== items.length) {
      return NextResponse.json(
        { error: 'Some agents are no longer available' },
        { status: 400 }
      )
    }

    // Create line items for Stripe
    const lineItems = agents.map((agent) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: agent.name,
          description: agent.description,
          images: agent.image ? [agent.image] : [],
          metadata: {
            agentId: agent.id,
            sellerId: agent.sellerId,
          },
        },
        unit_amount: Math.round(agent.price * 100), // Convert to cents
      },
      quantity: 1,
    }))

    // Add processing fee
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Processing Fee',
          description: 'Platform processing fee',
        },
        unit_amount: 299, // $2.99 in cents
      },
      quantity: 1,
    })

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.nextUrl.origin}/orders?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/marketplace?canceled=true`,
      customer_email: session.user.email || undefined,
      metadata: {
        userId: session.user.id,
        agentIds: JSON.stringify(agentIds),
      },
      payment_intent_data: {
        metadata: {
          userId: session.user.id,
          agentIds: JSON.stringify(agentIds),
        },
      },
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
