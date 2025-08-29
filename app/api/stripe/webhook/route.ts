import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic'; // ensure edge caching disabled
export const runtime = 'nodejs'; // needed for stripe sdk

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' as any });
  const sig = req.headers.get('stripe-signature') || '';
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  try {
    const payload = await req.text(); // raw body
    const event = stripe.webhooks.constructEvent(payload, sig, whSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[STRIPE] checkout.session.completed', session.id, session.metadata);
        // TODO: persistir en DB, enviar email/WhatsApp, bloquear fechas, etc.
        break;
      }
      default:
        console.log('[STRIPE] Event', event.type);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[STRIPE_WEBHOOK_ERROR]', err);
    return new NextResponse('Bad Request', { status: 400 });
  }
}
