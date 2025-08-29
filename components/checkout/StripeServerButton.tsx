'use client';
import React, { useState } from 'react';

export default function StripeServerButton({ amount, description, type='service' }: { amount?: number; description?: string; type?: 'service'|'booking' }) {
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    try {
      // amount en céntimos si se usa; si se configura STRIPE_PRICE_SERVICE, el backend ignora este amount
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description, type }),
      });
      if (!res.ok) throw new Error('No se pudo crear la sesión de Stripe');
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      alert('Error iniciando pago con Stripe');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={go} className="rounded-2xl px-5 py-3 border w-full" disabled={loading}>
      {loading ? 'Conectando con Stripe…' : 'Pagar con Stripe (server)'}
    </button>
  );
}
