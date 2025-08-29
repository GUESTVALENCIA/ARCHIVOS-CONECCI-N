import type { Metadata } from 'next';

const title = 'Contacto | GuestsValencia — Reserva y propuestas';
const description = 'Contacta para reservas, propuestas de gestión o soporte. Respuesta rápida 24/7 con Sandra IA.';
const ogImage = '/images/og-default.svg';

export const metadata: Metadata = {
  title,
  description,
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    type: 'website',
    url: '/contacto',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'GuestsValencia Contacto' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [ogImage],
  },
  alternates: { canonical: '/contacto' },
};

'use client';
import React from 'react';
import Script from 'next/script';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'GuestsValencia — Contacto',
  url: '/contacto',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+34 600 000 000',
    contactType: 'customer service',
    availableLanguage: ['es', 'en', 'fr', 'de', 'val'],
  },
};

export default function Page() {
  return (
    <main className="min-h-screen">
      <Script type="application/ld+json" id="schema-contacto" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs uppercase tracking-wide">Contacto</span>
        <h1 className="mt-4 text-4xl/tight font-semibold">Hablemos</h1>
        <p className="mt-4 text-muted-foreground">Cuéntanos qué necesitas y te respondemos rápido. Si prefieres WhatsApp, abajo tienes el botón directo.</p>

        <form className="mt-8 grid gap-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Nombre</label>
            <input className="w-full rounded-xl border px-4 py-3" placeholder="Tu nombre" required />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Email</label>
            <input type="email" className="w-full rounded-xl border px-4 py-3" placeholder="tucorreo@ejemplo.com" required />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Motivo</label>
            <select className="w-full rounded-xl border px-4 py-3" defaultValue="reserva">
              <option value="reserva">Reserva</option>
              <option value="propietario">Soy propietario/a</option>
              <option value="soporte">Soporte</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Mensaje</label>
            <textarea className="w-full rounded-xl border px-4 py-3 min-h-36" placeholder="Cuéntanos los detalles…" />
          </div>
          <div className="flex gap-3">
            <button className="rounded-2xl px-5 py-3 bg-black text-white" type="submit">Enviar</button>
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_PHONE || '34600000000'}?text=${encodeURIComponent('Hola, quiero contactar con GuestsValencia.')}`} className="rounded-2xl px-5 py-3 border">WhatsApp</a>
          </div>
        </form>
      </section>
    </main>
  );
}
