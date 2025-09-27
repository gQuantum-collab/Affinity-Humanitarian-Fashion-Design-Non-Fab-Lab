import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

// Next 14 expects one of the supported runtime identifiers. Use 'nodejs' instead of 'node'.
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const sig = req.headers.get('stripe-signature') || ''
  const body = await req.text()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 })
  }

  try {
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    const supabase = getSupabaseAdmin()

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as any
        await supabase.from('payments').insert([{ stripe_id: pi.id, amount: pi.amount_received || pi.amount, currency: pi.currency, status: 'succeeded', metadata: pi.metadata || {}, raw_event: event }])
        break
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as any
        await supabase.from('payments').insert([{ stripe_id: pi.id, amount: pi.amount || 0, currency: pi.currency || 'usd', status: 'failed', metadata: pi.metadata || {}, raw_event: event }])
        break
      }
      default:
        // store raw event for future analysis
        await supabase.from('payments').insert([{ stripe_id: (event.data?.object as any)?.id || null, amount: null, currency: null, status: event.type, metadata: {}, raw_event: event }])
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error', err && err.message ? err.message : String(err))
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 })
  }
}
