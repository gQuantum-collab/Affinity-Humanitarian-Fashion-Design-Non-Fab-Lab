import Stripe from 'stripe'

let cached: Stripe | null = null

export function getStripe(): Stripe {
  if (cached) return cached
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY')
  // Use the installed Stripe library's supported API version
  cached = new Stripe(key, { apiVersion: '2025-08-27.basil' })
  return cached
}
