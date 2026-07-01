import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const getUserId = (obj: Stripe.Subscription | Stripe.Customer) => {
    if ('metadata' in obj) return obj.metadata?.supabase_user_id
    return null
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.supabase_user_id
      if (!userId) break
      await supabaseAdmin.from('users').update({
        stripe_subscription_id: sub.id,
        subscription_status: sub.status === 'active' || sub.status === 'trialing' ? sub.status : 'inactive',
      }).eq('id', userId)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.supabase_user_id
      if (!userId) break
      await supabaseAdmin.from('users').update({
        subscription_status: 'inactive',
        stripe_subscription_id: null,
      }).eq('id', userId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
