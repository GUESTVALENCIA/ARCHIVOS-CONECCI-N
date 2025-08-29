import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' as any });
    const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const priceId: string | undefined = process.env.STRIPE_PRICE_SERVICE; // opcional para servicios (activación PropTech)
    const amountFromClient: number | undefined = body?.amount; // céntimos opcional (solo demo)
    const currency = body?.currency || 'eur';
    const description = body?.description || 'Pago GuestsValencia';

    const line_items = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [{
          price_data: {
            currency,
            product_data: { name: description },
            unit_amount: typeof amountFromClient === 'number' ? Math.max(1, Math.floor(amountFromClient)) : 1000, // 10€ fallback
          },
          quantity: 1,
        }];

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      success_url: `${site}/contacto?ok=stripe`,
      cancel_url: `${site}/contacto?cancel=stripe`,
      metadata: {
        project: 'GuestsValencia',
        type: body?.type || 'booking|service',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[STRIPE_CREATE_SESSION_ERROR]', err);
    return new NextResponse('Bad Request', { status: 400 });
  }
}
