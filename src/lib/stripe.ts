import { loadStripe, type Stripe as StripeJS } from '@stripe/stripe-js'

let stripePromise: Promise<StripeJS | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
    )
  }
  return stripePromise
}

// Server-side Stripe instance
import Stripe from 'stripe'

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || '',
  {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
  }
)
