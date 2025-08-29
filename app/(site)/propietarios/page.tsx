'use client';
import React from 'react';
import Link from 'next/link';

const plans = [
  {
    id: 'turistico-esencial',
    name: 'Turístico Esencial',
    price: '15% por reserva',
    sub: 'IVA no incluido · + gastos de limpieza',
    bullets: [
      'Optimización profesional del anuncio',
      'Estrategia de precios (revenue) dinámica',
      'Gestión integral de reservas',
      'Check‑in / Check‑out',
      'Limpieza profesional',
      'Mantenimiento básico',
    ],
    cta: 'Solicitar información',
  },
  {
    id: 'turistico-premium',
    name: 'Turístico Premium',
    price: '20% por reserva',
    sub: 'IVA no incluido · + gastos de limpieza',
    bullets: [
      'Todo lo de Esencial, más:',
      'Amenities premium',
      'Reportaje fotográfico profesional',
      'Línea de atención preferente',
      'Mantenimientos y reparaciones',
      'Reporte económico mensual',
      'Instalación Smart Lock',
      'Revisiones de calidad',
      '2 limpiezas adicionales incluidas',
    ],
    highlight: true,
    cta: 'Solicitar información',
  },
  {
    id: 'temporada',
    name: 'De Temporada (Media estancia)',
    price: '12% por reserva',
    sub: 'IVA no incluido · + gastos de limpieza · Estancias > 27 días',
    bullets: [
      'Estrategia específica para 1–11 meses',
      'Selección de perfil inquilino',
      'Gestión de reservas y cobros',
      'Check‑in / Check‑out',
      'Limpieza y coordinación',
      'Mantenimiento durante la estancia',
    ],
    cta: 'Solicitar información',
  },
  {
    id: 'renta-mensual',
    name: 'Renta Mensual (garantizada)',
    price: 'Importe mensual garantizado',
    sub: 'IVA no incluido · + gastos de limpieza',
    bullets: [
      'Ingresos fijos cada mes',
      'Cobros puntuales a principio de mes',
      'Mayor ingreso que alquiler a largo plazo',
      'Protección ante la fluctuación del mercado',
      'Mantenimientos incluidos',
      'Suministros incluidos',
      'Una sola factura mensual',
    ],
    cta: 'Solicitar información',
  },
];

const badges = [
  'Recepción 7★ con IA Sandra (ES/VA/EN/FR/DE)',
  'Llegada 100% autónoma (smart lock / caja seguridad)',
  'Pricing dinámico + campañas en redes',
  'App de propietario: reservas, ingresos y avisos en tiempo real',
  'Negociación en tiempo real y venta directa sin comisiones de OTA en web propia',
  'Bienestar para huéspedes: mindfulness, yoga y pilates (planes VIP)',
  'Plan de llegada multimedia por WhatsApp (rutas, horarios, opciones)',
];

export default function Page() {
  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div>
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs uppercase tracking-wide">Propietarios</span>
            <h1 className="mt-4 text-4xl/tight font-semibold">Gestión integral y transparente para tu propiedad</h1>
            <p className="mt-4 text-muted-foreground max-w-xl">Maximizamos tus ingresos con tecnología PropTech y hospitalidad 7★. Operativa completa, transparencia total y atención multilingüe con <strong>Sandra IA</strong>.</p>
            <div className="mt-6 flex gap-3">
              <Link href="/contacto" className="rounded-2xl px-5 py-3 bg-black text-white hover:opacity-90">Solicitar valoración gratuita</Link>
              <a href="https://wa.me/34600000000?text=Quiero%20valorar%20mi%20propiedad" className="rounded-2xl px-5 py-3 border">Hablar por WhatsApp</a>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="rounded-2xl border p-4">
              <p className="text-sm font-medium mb-3">¿Por qué con nosotros?</p>
              <ul className="grid gap-2 text-sm">
                {badges.map((b) => (
                  <li key={b} className="flex items-start gap-2"><span className="mt-1 size-1.5 rounded-full bg-black"/> {b}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold">Planes de gestión</h2>
          <p className="mt-2 text-muted-foreground">Elige el modelo que mejor encaje con tu activo. Todos incluyen atención 7★ y reportes claros.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((p) => (
              <div key={p.id} className={`rounded-2xl border p-6 ${p.highlight ? 'ring-2 ring-black' : ''}`}>
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <p className="mt-1 text-2xl font-bold">{p.price}</p>
                <p className="text-xs text-muted-foreground">{p.sub}</p>
                <ul className="mt-4 grid gap-2 text-sm">
                  {p.bullets.map((b) => <li key={b} className="flex items-start gap-2"><span className="mt-1 size-1.5 rounded-full bg-black"/> {b}</li>)}
                </ul>
                <a href="/contacto" className="mt-6 inline-block rounded-xl bg-black px-4 py-2 text-white">{p.cta}</a>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">* Porcentajes orientativos. Condiciones sujetas a tipo de inmueble y temporada. IVA no incluido.</p>
        </div>
      </section>

      {/* CÓMO EMPEZAMOS */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-semibold">Cómo empezamos</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            {
              t: '1) Estudio de rentabilidad',
              d: 'Analizamos ubicación, capacidad y temporada para proyectar ingresos. (48h)'
            },
            {
              t: '2) Puesta a punto',
              d: 'Fotografías, anuncio, amenities y configuración de precios dinámicos.'
            },
            {
              t: '3) Go‑Live',
              d: 'Activamos canales y web propia. Check‑in autónomo listo y Sandra IA atendiendo 24/7.'
            },
          ].map((s) => (
            <div key={s.t} className="rounded-2xl border p-6 bg-white">
              <h3 className="font-medium">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/contacto" className="rounded-2xl px-5 py-3 bg-black text-white">Solicitar valoración gratuita</Link>
        </div>
      </section>
    </main>
  );
}
