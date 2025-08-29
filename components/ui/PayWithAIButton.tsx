'use client';
import React from 'react';

export default function PayWithAIButton({ label='Pago Fácil con IA', english=false, amount=19900 }: { label?: string; english?: boolean; amount?: number }) {
  function speak(text: string) {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = english ? 'en-US' : 'es-ES';
    synth.cancel();
    synth.speak(utter);
  }

  async function activate() {
    const phraseEs = 'Somos PropTech. Te acompañamos en tiempo real. Iniciando Pago Fácil con IA.';
    const phraseEn = 'We are PropTech. Guiding you in real-time. Starting Easy Payment with AI.';
    speak(english ? phraseEn : phraseEs);

    // Crear sesión server-side para el servicio PropTech (usa STRIPE_PRICE_SERVICE si está)
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, description: 'Activación Servicios PropTech — GuestsValencia', type: 'service' }),
    });
    const data = await res.json();
    if (data?.url) window.location.href = data.url;
  }

  return (
    <button onClick={activate} className="rounded-2xl px-5 py-3 bg-black text-white w-full">
      {english ? 'Easy Payment with AI' : label}
    </button>
  );
}
