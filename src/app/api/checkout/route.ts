import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const { consultationId } = await req.json()
    
    const stripeKey = process.env.STRIPE_SECRET_KEY || ''
    if (!stripeKey || stripeKey.startsWith('sk_test_your') || stripeKey.length < 40) {
      return NextResponse.json({ demo: true, clientSecret: 'demo_secret', message: 'Mode démo activé' })
    }
    
    const stripe = new Stripe(stripeKey)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2900, currency: 'cad',
      metadata: { consultationId },
      automatic_payment_methods: { enabled: true }
    })
    
    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (e: any) {
    return NextResponse.json({ demo: true, clientSecret: 'demo_secret', error: e.message })
  }
}
