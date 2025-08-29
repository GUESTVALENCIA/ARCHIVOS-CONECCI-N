'use client';
import React from 'react';
import Link from 'next/link';

const services = [
  {
    title: 'Comercialización y marketing',
    bullets: [
      'Copywriting persuasivo y publicación multicanal (Airbnb, Booking, Vrbo, Web propia)',
      'Reportaje fotográfico profesional y setup de amenities',
      'Campañas en redes y posicionamiento del anuncio',
    ],
  },
  {
    title: 'Revenue Management',
    bullets: [
      'Tarifas dinámicas con datos de demanda, temporada y eventos',
      'Optimización de ocupación e ingresos por canal',
      'Simulador de rentabilidad para propietarios',
    ],
  },
  {
    title: 'Operativa y calidad',
    bullets: [
      'Check‑in/out flexible (smart lock, caja de seguridad o recepción asistida)',
      'Limpiezas hoteleras y control post‑estancia',
      'Mantenimiento preventivo y correctivo',
    ],
  },
  {
    title: 'Atención al huésped 24/7',
    bullets: [
      'Multilingüe (ES/VA/EN/FR/DE)',
      'IA Sandra por voz, texto y video',
      'Guía local y resolución de incidencias',
    ],
  },
  {
    title: 'Tecnología PropTech',
    bullets: [
      'App de propietario con reservas, ingresos y avisos en tiempo real',
      'FAQ multimedia (texto + audio + video) para dudas clave',
      'Panel de control y reportes mensuales',
    ],
  },
  {
    title: 'Onboarding legal y asesoría',
    bullets: [
      'Licencias turísticas, contratos y cumplimiento',
      'Seguros, normativa y prevención de riesgos',
      'Asesoría fiscal y de inversión',
    ],
  },
  {
    title: 'Experiencia y upsells',
    bullets: [
      'Plan de llegada por WhatsApp (rutas y horarios)',
      'Acuerdos locales (restaurantes, ocio, transfers)',
      'Bienestar (mindfulness, yoga, pilates) en planes VIP',
    ],
  },
];

export default function Page() {
  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs uppercase tracking-wide">Servicios</span>
          <h1 className="mt-4 text-4xl/tight font-semibold">Suite de servicios PropTech & gestión 7★</h1>
          <p className="mt-4 text-muted-foreground">Cobertura completa para alquiler turístico y de temporada: desde la captación y el pricing hasta la operativa, la atención 24/7 y el reporte de resultados.</p>
          <div className="mt-6 flex gap-3">
            <Link href="/contacto" className="rounded-2xl px-5 py-3 bg-black text-white hover:opacity-90">Pedir propuesta</Link>
            <a href="/alojamientos" className="rounded-2xl px-5 py-3 border">Ver alojamientos</a>
          </div>
        </div>
      </section>

      {/* LISTA DE SERVICIOS */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((s) => (
              <div key={s.title} className="rounded-2xl border p-6 bg-white">
                <h2 className="text-xl font-semibold">{s.title}</h2>
                <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2"><span className="mt-1 size-1.5 rounded-full bg-black"/> {b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-2xl border p-8 bg-white">
          <h2 className="text-2xl font-semibold">¿Listo para profesionalizar tu alquiler?</h2>
          <p className="mt-2 text-muted-foreground">Te preparamos un estudio de rentabilidad y un plan de puesta en marcha en 72h.</p>
          <div className="mt-4 flex gap-3">
            <Link href="/contacto" className="rounded-2xl px-5 py-3 bg-black text-white">Solicitar valoración</Link>
            <a href="https://wa.me/34600000000?text=Quiero%20una%20propuesta" className="rounded-2xl px-5 py-3 border">WhatsApp</a>
          </div>
        </div>
      </section>
    </main>
  );
}
