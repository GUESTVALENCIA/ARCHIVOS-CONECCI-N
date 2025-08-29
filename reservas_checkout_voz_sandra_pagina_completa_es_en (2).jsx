'use client'

// Reservas + Checkout + Voz (Sandra) — página completa ES/EN (robusta)
// Next.js (App Router o Pages) + TailwindCSS
// FIXES:
// - Elimina dependencias de `process` en el cliente (evita ReferenceError: process is not defined)
// - Importa PayStripeForBooking con dynamic + { ssr:false } para evitar React error #310 por hidratación
// - Manejo seguro de URL pública de Sandra (meta tag / window / env si existe)
// - Timeouts, control de errores y banner cuando la URL no está configurada
// - Tests de desarrollo en consola sin usar NODE_ENV

import React, { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// ⛓️ Importa tu helper real de Stripe (v1.6) deshabilitando SSR para evitar mismatches
const PayStripeForBooking = dynamic(() => import('@/components/checkout/PayStripeForBooking'), { ssr: false })

// =========================
// Utils de entorno (cliente)
// =========================
const isBrowser = typeof window !== 'undefined'
const isLikelyDev = isBrowser && (
  ['localhost', '127.0.0.1'].includes(window.location.hostname) ||
  window.location.hostname.endsWith('.local')
)

function readPublicSandraUrlFromDom(): string {
  if (!isBrowser) return ''
  // 1) Meta tag <meta name="sandra-api-url" content="..."> (opcional)
  const meta = document.querySelector('meta[name="sandra-api-url"]') as HTMLMetaElement | null
  if (meta?.content) return meta.content.trim()
  // 2) Variable global (opcional): window.NEXT_PUBLIC_SANDRA_API_URL
  const g = (window as any).NEXT_PUBLIC_SANDRA_API_URL
  if (g && typeof g === 'string') return g.trim()
  // 3) En Next.js el bundler puede inyectar process.env.*: úsalo sólo si existe para evitar ReferenceError
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fromEnv = (typeof process !== 'undefined' && (process as any)?.env?.NEXT_PUBLIC_SANDRA_API_URL)
    if (fromEnv && typeof fromEnv === 'string') return fromEnv.trim()
  } catch {}
  return ''
}

// Valida y normaliza la URL (acepta absoluta https/http o relativa /api/...)
export function getSandraUrl(rawEnv?: string): string | null {
  const raw = (rawEnv ?? readPublicSandraUrlFromDom()).trim()
  if (!raw) return null
  try {
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      new URL(raw) // valida formato
      return raw
    }
    if (raw.startsWith('/')) return raw // ruta relativa válida
    return null
  } catch {
    return null
  }
}

// =========================
// Cliente Sandra API con timeout + control de errores
// =========================
export async function askSandra(prompt: string, locale: 'es'|'en', context?: any): Promise<string> {
  const url = getSandraUrl()
  if (!url) {
    return locale==='es'
      ? 'La API de Sandra no está configurada. Define una URL pública (meta tag, window.NEXT_PUBLIC_SANDRA_API_URL o .env)'
      : 'Sandra API is not configured. Provide a public URL (meta tag, window.NEXT_PUBLIC_SANDRA_API_URL or .env)'
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000) // 10s
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'Eres Sandra, recepcionista 7★. Sé breve, clara y cálida.' },
          { role: 'user', content: prompt },
        ],
        locale,
        context: context ?? null,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return locale==='es'
        ? `Sandra devolvió ${res.status}. ${text || ''}`.trim()
        : `Sandra returned ${res.status}. ${text || ''}`.trim()
    }

    let data: any = {}
    try { data = await res.json() } catch {
      return locale==='es' ? 'Respuesta de Sandra no es JSON válido.' : 'Sandra response is not valid JSON.'
    }

    const reply = typeof data?.reply === 'string' ? data.reply : ''
    return reply || (locale==='es' ? 'Sandra no envió contenido.' : 'Sandra returned empty message.')
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      return locale==='es' ? 'Tiempo de espera agotado al contactar con Sandra.' : 'Timed out contacting Sandra.'
    }
    return locale==='es' ? `Error de red: ${e?.message || e}` : `Network error: ${e?.message || e}`
  } finally {
    clearTimeout(timeout)
  }
}

// =========================
// Voz: TTS + Reconocimiento con VAD (estilo ChatGPT Voice)
// =========================
function speak(text: string, lang: 'es'|'en', onEnd?: () => void) {
  if (!isBrowser || !('speechSynthesis' in window) || !text) { onEnd?.(); return }
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang==='es' ? 'es-ES' : 'en-US'
  u.onend = () => { onEnd?.() }
  try { window.speechSynthesis.cancel() } catch {}
  window.speechSynthesis.speak(u)
}

// VAD básico con Web Speech API: escucha siempre; cuando detecta fin de frase, envía a Sandra;
// mientras Sandra "piensa" o habla, pausa el micrófono y lo reanuda al terminar.
function useVoiceVAD(onFinalUtterance: (finalText: string) => Promise<void>) {
  const [listening, setListening] = useState(false)
  const [busy, setBusy] = useState(false) // true cuando estamos llamando a Sandra o hablando
  const [interim, setInterim] = useState('')
  const [lastFinal, setLastFinal] = useState('')
  const recRef = useRef<any>(null)
  const wantOnRef = useRef(true) // queremos estar escuchando cuando no estamos ocupados

  useEffect(() => {
    if (!isBrowser) return
    const Rec = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!Rec) return

    const rec = new Rec()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = navigator.language?.startsWith('es') ? 'es-ES' : 'en-US'

    let bufferFinal = ''
    rec.onresult = (e: any) => {
      let interimChunk = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]
        if (res.isFinal) {
          bufferFinal += res[0]?.transcript + ' '
        } else {
          interimChunk += res[0]?.transcript
        }
      }
      setInterim(interimChunk)
      if (bufferFinal.trim()) {
        setLastFinal(bufferFinal.trim())
      }
    }

    rec.onend = async () => {
      setListening(false)
      const finalToProcess = lastFinal || ''
      setInterim('')
      if (finalToProcess && !busy) {
        try {
          setBusy(true)
          await onFinalUtterance(finalToProcess)
        } finally {
          setBusy(false)
        }
      }
      // Reanudar si queremos escuchar y no estamos ocupados
      if (wantOnRef.current && !busy) {
        try { rec.start(); setListening(true) } catch {}
      }
    }

    recRef.current = rec
    // Arranca automáticamente al montar
    if (!busy) {
      try { rec.start(); setListening(true) } catch {}
    }

    return () => { try { rec.stop() } catch {} }
  }, [busy, onFinalUtterance, lastFinal])

  // Cuando entramos en estado busy, paramos el micro. Al salir, lo reanudamos.
  useEffect(() => {
    const rec = recRef.current
    if (!rec) return
    if (busy) {
      wantOnRef.current = true
      try { rec.stop() } catch {}
      setListening(false)
    } else {
      try { rec.start(); setListening(true) } catch {}
    }
  }, [busy])

  return { listening, busy, interim }
}

// =========================
// Datos de ejemplo (sustituye por Prisma/DB)
// =========================
export type Listing = {
  id: string
  slug: string
  title: string
  city: string
  images: string[]
  pricePerNightCents: number
  rating: number
  beds: number
  baths: number
  guestsMax: number
  sizeM2: number
  features: string[]
}

const SAMPLE_LISTINGS: Listing[] = [
  {
    id: 'altea-hills',
    slug: 'altea-hills-villa-lujo',
    title: 'Villa de Lujo · Mirador de Altea Hills',
    city: 'Altea (Alicante)',
    images: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511',
      'https://images.unsplash.com/photo-1505691723518-36a5ac3b2b8f',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'
    ],
    pricePerNightCents: 24500,
    rating: 4.9,
    beds: 3,
    baths: 2,
    guestsMax: 6,
    sizeM2: 140,
    features: [
      'Vistas panorámicas al mar', 'Piscina comunitaria', 'Terraza y balcón', 'Barbacoa y paellero comunitario',
      'Smart TV 65" 4K HDR con Netflix/Prime/Apple TV', 'Wi‑Fi 600 Mbps', 'Aire acondicionado en todas las estancias',
      'Lavavajillas', 'Horno eléctrico', 'Microondas', 'Cafetera Nespresso', 'Tostadora', 'Hervidor', 'Menaje completo',
      'Mesa comedor 6 personas', 'Sofá chaise longue', 'Sábanas y toallas premium', 'Secador', 'Plancha',
      'Caja fuerte', 'Cerradura digital', 'Llegada autónoma', 'Parking en calle cerrada', 'Cuna bajo petición',
    ],
  },
  {
    id: 'valencia-mendez',
    slug: 'valencia-mendez-nunez-47',
    title: 'Valencia · Méndez Núñez 47 — Habitación',
    city: 'Valencia',
    images: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
      'https://images.unsplash.com/photo-1522599511979-41c7f3f8a2f8'
    ],
    pricePerNightCents: 12900,
    rating: 4.7,
    beds: 1,
    baths: 1,
    guestsMax: 2,
    sizeM2: 18,
    features: [
      'Llegada autónoma (llave en caja de seguridad)', 'Smart TV 43" con apps', 'Wi‑Fi 600 Mbps',
      'Aire acondicionado', 'Calefacción', 'Escritorio de trabajo', 'Armario', 'Sábanas y toallas',
      'Cocina compartida equipada', 'Microondas', 'Nevera', 'Menaje básico', 'Lavadora compartida',
      'Ascensor', 'Zona bien comunicada',
    ],
  },
  {
    id: 'montanejos-duplex',
    slug: 'montanejos-duplex-termal',
    title: 'Dúplex Montanejos · Acceso Fuente de los Baños',
    city: 'Montanejos',
    images: [
      'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'
    ],
    pricePerNightCents: 9900,
    rating: 4.8,
    beds: 2,
    baths: 2,
    guestsMax: 5,
    sizeM2: 95,
    features: [
      'Acceso incluido a aguas termales', 'Cerraduras digitales', 'Cocina equipada', 'Lavavajillas', 'Horno', 'Microondas',
      'TV 55" 4K con streaming', 'Wi‑Fi', 'Balcón', 'Vistas a la sierra', 'Parking cercano', 'Sofá cama', 'Ducha efecto lluvia',
    ],
  },
]

// =========================
// UI helpers
// =========================
function stars(rating: number) { return '★★★★★☆☆☆☆☆'.slice(5 - Math.round(rating), 10 - Math.round(rating)) }
function currency(cents: number) { return (cents/100).toLocaleString(undefined, { style: 'currency', currency: 'EUR' }) }

// Parser muy simple de comandos de voz
function parseCommand(raw: string) {
  const q = raw.toLowerCase()
  if (/abr(e|i)r|open/.test(q)) return { intent: 'open', arg: q.replace(/^(abr(e|i)r|open)\s*/, '').trim() }
  if (/fotos|photos|pictures|galer(í|i)a/.test(q)) return { intent: 'gallery' }
  if (/baño|bath(room)?/.test(q)) return { intent: 'show_bathroom' }
  if (/habitaci(ó|o)n|room/.test(q)) return { intent: 'show_rooms' }
  if (/caracter(í|i)sticas|features|amenities/.test(q)) return { intent: 'show_features' }
  if (/(pagar|checkout|pago|pay)/.test(q)) return { intent: 'pay' }
  if (/(atr(á|a)s|back|cerrar|close)/.test(q)) return { intent: 'close' }
  return { intent: 'ask', arg: raw }
}

// =========================
// Card de alojamiento
// =========================
function ListingCard({ item, onSelect }: { item: Listing; onSelect: (l: Listing)=>void }) {
  return (
    <div className="group rounded-2xl overflow-hidden border border-black/10 bg-white shadow hover:shadow-lg transition">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
        <div className="absolute top-3 left-3 text-xs px-2 py-1 rounded-full bg-black/70 text-white">{item.city}</div>
        <div className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-white/90">{stars(item.rating)} {item.rating.toFixed(1)}</div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-lg leading-snug line-clamp-2">{item.title}</h3>
        <div className="text-sm text-black/70">{item.beds} camas · {item.baths} baños · {item.sizeM2} m² · hasta {item.guestsMax} huéspedes</div>
        <div className="flex flex-wrap gap-2 text-xs pt-1">
          {item.features.slice(0, 4).map((f, i) => (
            <span key={i} className="px-2 py-1 rounded-full bg-black/5">{f}</span>
          ))}
          {item.features.length > 4 && <span className="px-2 py-1 rounded-full bg-black/5">+{item.features.length-4}</span>}
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="font-bold">{currency(item.pricePerNightCents)} <span className="font-normal text-sm text-black/60">/ noche</span></div>
          <button onClick={()=>onSelect(item)} className="px-3 py-2 rounded-xl bg-indigo-600 text-white shadow hover:shadow-md active:scale-95">Ver</button>
        </div>
      </div>
    </div>
  )
}

// =========================
// Modal Detalle + Checkout + Sandra
// =========================
function ListingModal({ open, onClose, listing }:{ open:boolean; onClose:()=>void; listing: Listing|null }) {
  const lang: 'es'|'en' = isBrowser && navigator.language?.startsWith('es') ? 'es':'en'
  const [tab, setTab] = useState<'overview'|'features'|'rooms'|'photos'>('overview')
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [email, setEmail] = useState('')
  const [guests, setGuests] = useState(2)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sandraLog, setSandraLog] = useState<{ who:'user'|'sandra', text:string }[]>([])

  const { listening, start, stop } = useVoiceControl(async (raw) => {
    const cmd = parseCommand(raw)
    if (!listing) return
    if (cmd.intent==='open') {
      speak(lang==='es' ? 'Ya estás viendo el alojamiento seleccionado.' : 'You are already viewing this stay.', lang)
    } else if (cmd.intent==='gallery') {
      setTab('photos'); speak(lang==='es'?'Abriendo fotos.':'Opening photos.', lang)
    } else if (cmd.intent==='show_bathroom') {
      setTab('photos'); setGalleryIndex(Math.min(2, listing.images.length-1)); speak(lang==='es'?'Mostrando fotos del baño.':'Showing bathroom photos.', lang)
    } else if (cmd.intent==='show_rooms') {
      setTab('rooms'); speak(lang==='es'?'Mostrando habitaciones.':'Showing rooms.', lang)
    } else if (cmd.intent==='show_features') {
      setTab('features'); speak(lang==='es'?'Mostrando características.':'Showing features.', lang)
    } else if (cmd.intent==='pay') {
      speak(lang==='es'?'Abriendo pago seguro.':'Opening secure checkout.', lang)
    } else if (cmd.intent==='close') {
      onClose()
    } else {
      setSandraLog((prev)=>[...prev, { who:'user', text: raw }])
      const reply = await askSandra(raw, lang, { listing: listing.slug })
      setSandraLog((prev)=>[...prev, { who:'sandra', text: reply }])
      speak(reply, lang)
    }
  })

  useEffect(()=>{ if(!open){ stop(); setSandraLog([]) } }, [open])
  if (!open || !listing) return null

  const nights = useMemo(()=> {
    if(!startDate || !endDate) return 0
    const a = new Date(startDate), b = new Date(endDate)
    const diff = Math.round((b.getTime()-a.getTime())/(24*3600*1000))
    return Math.max(0, diff)
  }, [startDate, endDate])

  const totalCents = nights * listing.pricePerNightCents
  const urlConfigured = !!getSandraUrl()

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[min(1100px,95vw)] md:h-[min(86vh,800px)] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-5">
        {/* Gallery / Lateral */}
        <div className="md:col-span-3 relative bg-black">
          <img src={listing.images[galleryIndex]} alt={listing.title} className="w-full h-full object-cover" />
          <div className="absolute bottom-3 left-0 right-0 flex gap-2 px-3 overflow-x-auto">
            {listing.images.map((src, i)=>(
              <button key={i} onClick={()=>setGalleryIndex(i)} className={`h-16 aspect-video rounded-lg overflow-hidden border ${i===galleryIndex?'border-white':'border-white/30'}`}>
                <img src={src} alt="mini" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm bg-white/90">{lang==='es'?'Cerrar':'Close'}</button>
        </div>

        {/* Content */}
        <div className="md:col-span-2 flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-xl leading-tight">{listing.title}</h3>
            <div className="text-sm text-black/70">{listing.city} · {stars(listing.rating)} {listing.rating.toFixed(1)}</div>
          </div>

          {/* Tabs */}
          <div className="px-4 pt-3 flex gap-2 text-sm">
            {['overview','features','rooms','photos'].map((t)=> (
              <button key={t} onClick={()=>setTab(t as any)} className={`px-3 py-1.5 rounded-full border ${tab===t?'bg-black text-white':'bg-white'}`}>
                {t==='overview' ? (lang==='es'?'Resumen':'Overview') :
                 t==='features' ? (lang==='es'?'Características':'Features') :
                 t==='rooms' ? (lang==='es'?'Habitaciones':'Rooms') :
                 (lang==='es'?'Fotos':'Photos')}
              </button>
            ))}
          </div>

          {!urlConfigured && (
            <div className="mx-4 mt-3 mb-1 p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-900 text-xs">
              {lang==='es'
                ? 'Aviso: no hay URL pública configurada para Sandra. El chat mostrará un aviso en lugar de llamar a la API.'
                : 'Heads up: no public URL configured for Sandra. Chat will show a notice instead of calling the API.'}
            </div>
          )}

          <div className="p-4 flex-1 overflow-y-auto">
            {tab==='overview' && (
              <div className="space-y-3">
                <div className="text-sm text-black/80">
                  {lang==='es'
                    ? 'Alojamiento con todo lo necesario para una estancia cómoda y moderna. Sandra puede ayudarte a resolver dudas o mostrarte más fotos por voz.'
                    : 'A stay with everything you need for a modern, comfy visit. Ask Sandra for help or more photos by voice.'}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-3 rounded-xl bg-black/5">🛏️ {listing.beds} {lang==='es'?'camas':'beds'}</div>
                  <div className="p-3 rounded-xl bg-black/5">🛁 {listing.baths} {lang==='es'?'baños':'baths'}</div>
                  <div className="p-3 rounded-xl bg-black/5">👥 {listing.guestsMax} {lang==='es'?'huéspedes':'guests'}</div>
                  <div className="p-3 rounded-xl bg-black/5">📏 {listing.sizeM2} m²</div>
                </div>

                {/* Booking form + Stripe */}
                <div className="mt-4 border-t pt-4 space-y-3">
                  <div className="font-semibold">{lang==='es'?'Reserva ahora':'Book now'}</div>
                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div>
                      <label className="block text-xs text-black/60">{lang==='es'?'Entrada':'Check-in'}</label>
                      <input type="date" className="w-full border rounded-xl px-3 py-2" value={startDate} onChange={e=>setStartDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-black/60">{lang==='es'?'Salida':'Check-out'}</label>
                      <input type="date" className="w-full border rounded-xl px-3 py-2" value={endDate} onChange={e=>setEndDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-black/60">{lang==='es'?'Huéspedes':'Guests'}</label>
                      <input type="number" min={1} max={listing.guestsMax} className="w-full border rounded-xl px-3 py-2" value={guests} onChange={e=>setGuests(parseInt(e.target.value||'1'))} />
                    </div>
                    <div>
                      <label className="block text-xs text-black/60">Email</label>
                      <input type="email" className="w-full border rounded-xl px-3 py-2" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-black/70">
                      {nights>0
                        ? `${nights} ${lang==='es'?'noches':'nights'} · ${currency(listing.pricePerNightCents)} / ${lang==='es'?'noche':'night'}`
                        : (lang==='es'?'Selecciona fechas':'Select dates')}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-black/60">{lang==='es'?'Total estimado':'Estimated total'}</div>
                      <div className="text-lg font-semibold">{currency(totalCents)}</div>
                    </div>
                  </div>

                  {/* Botón Stripe (usa tu helper v1.6) */}
                  <div className="pt-1">
                    <PayStripeForBooking
                      slug={listing.slug}
                      title={listing.title}
                      amountCents={Math.max(1, totalCents)}
                      email={email || 'cliente@example.com'}
                      startDate={startDate || new Date().toISOString().slice(0,10)}
                      endDate={endDate || new Date(Date.now()+86400000).toISOString().slice(0,10)}
                      guests={guests}
                    />
                    <p className="text-[11px] text-black/50 mt-1">{lang==='es'?'Pago seguro con Stripe.':'Secure payment via Stripe.'}</p>
                  </div>
                </div>

                {/* Sandra Voice controls */}
                <div className="mt-4 p-3 rounded-2xl border bg-black/5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium">{lang==='es'?'Sandra por voz':'Sandra by voice'}</div>
                    <button onClick={listening?()=>stop():()=>start()} className={`px-3 py-1.5 rounded-full text-sm border ${listening?'bg-red-600 text-white':'bg-white'}`}>
                      {listening ? (lang==='es'?'Detener':'Stop') : (lang==='es'?'Hablar':'Talk')}
                    </button>
                  </div>
                  <div className="mt-2 max-h-28 overflow-auto space-y-1 text-sm">
                    {sandraLog.map((m,i)=>(
                      <div key={i} className={m.who==='user'?'text-right':''}>
                        <span className={`inline-block px-2 py-1 rounded-xl ${m.who==='user'?'bg-indigo-600 text-white':'bg-black/5'}`}>{m.text}</span>
                      </div>
                    ))}
                    {sandraLog.length===0 && (
                      <div className="text-xs text-black/60">
                        {lang==='es'
                          ? 'Di: "Mostrar fotos", "Mostrar características", "Pagar", "Cerrar" o haz preguntas.'
                          : 'Say: "Show photos", "Show features", "Pay", "Close" or ask questions.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {tab==='features' && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                {listing.features.map((f,i)=> (
                  <div key={i} className="px-3 py-2 rounded-xl bg-black/5">• {f}</div>
                ))}
              </div>
            )}

            {tab==='rooms' && (
              <div className="space-y-2 text-sm">
                <div className="p-3 rounded-xl bg-black/5">🛏️ {lang==='es'?'Dormitorio principal con cama queen y armario.':'Master bedroom with queen bed and closet.'}</div>
                <div className="p-3 rounded-xl bg-black/5">🛏️ {lang==='es'?'Dormitorio secundario con dos individuales.':'Second bedroom with two singles.'}</div>
                <div className="p-3 rounded-xl bg-black/5">🛁 {lang==='es'?'Baño con ducha efecto lluvia.':'Bathroom with rain shower.'}</div>
                <div className="p-3 rounded-xl bg-black/5">🍽️ {lang==='es'?'Comedor para 6 personas.':'Dining table for 6.'}</div>
              </div>
            )}

            {tab==='photos' && (
              <div className="grid grid-cols-2 gap-2">
                {listing.images.map((src,i)=> (
                  <img key={i} src={src} alt={`photo-${i}`} className="w-full aspect-video object-cover rounded-xl" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// =========================
// Página de Reservas
// =========================
export default function ReservationsPage() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Listing|null>(null)
  const lang: 'es'|'en' = isBrowser && navigator.language?.startsWith('es') ? 'es':'en'

  const data = SAMPLE_LISTINGS // Reemplaza por fetch a tu API/Prisma
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data.filter(l => [l.title, l.city, l.slug].join(' ').toLowerCase().includes(q))
  }, [query, data])

  return (
    <div className="min-h-[80vh]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-white to-white" />
        <div className="relative max-w-7xl mx-auto px-4 py-10 md:py-14">
          <h1 className="text-2xl md:text-4xl font-bold leading-tight">{lang==='es'?'Reserva tu alojamiento perfecto':'Book your perfect stay'}</h1>
          <p className="mt-2 text-black/70 max-w-2xl">
            {lang==='es'
              ? 'Explora alojamientos con listas detalladas de comodidades, fotos en alta calidad y pago seguro con Stripe.'
              : 'Explore stays with rich amenity lists, high‑quality photos and secure Stripe checkout.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <input
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
              placeholder={lang==='es'?'Buscar por ciudad, nombre…':'Search by city, name…'}
              className="w-full md:w-96 border rounded-xl px-4 py-2.5 shadow-sm"
            />
            <span className="text-xs text-black/60">{filtered.length} {lang==='es'?'resultados':'results'}</span>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(l => (
          <ListingCard key={l.id} item={l} onSelect={(it)=>setSelected(it)} />
        ))}
      </section>

      {/* Modal detalle */}
      <ListingModal open={!!selected} listing={selected} onClose={()=>setSelected(null)} />
    </div>
  )
}

// =========================
// 🧪 DEV TESTS (consola, sólo en entornos de desarrollo probables)
// =========================
function runDevTests() {
  try {
    console.groupCollapsed('%c[Sandra Tests]','color:#6b21a8')

    // Casos para getSandraUrl
    const urlCases = [
      { name: 'URL vacía', input: '', expect: null },
      { name: 'URL relativa', input: '/api/sandra/chat', expect: '/api/sandra/chat' },
      { name: 'URL absoluta válida', input: 'https://example.com/sandra', expect: 'https://example.com/sandra' },
      { name: 'URL inválida', input: 'ht!tp:/bad', expect: null },
      { name: 'URL con espacios', input: '   https://ex.com/x  ', expect: 'https://ex.com/x' },
      { name: 'Relativa sin slash inicial', input: 'api/sandra', expect: null },
    ]
    for (const c of urlCases) {
      const got = getSandraUrl(c.input as any)
      console.assert(got === c.expect, `${c.name} → esperado: ${c.expect}, obtenido: ${got}`)
    }

    // Casos para parseCommand
    const parseCases = [
      { q: 'abrir Altea', intent: 'open' },
      { q: 'Mostrar fotos', intent: 'gallery' },
      { q: 'baño', intent: 'show_bathroom' },
      { q: 'habitacion', intent: 'show_rooms' },
      { q: 'caracteristicas', intent: 'show_features' },
      { q: 'pagar ahora', intent: 'pay' },
      { q: 'cerrar', intent: 'close' },
      { q: '¿tienen ascensor?', intent: 'ask' },
    ]
    for (const t of parseCases) {
      const got = parseCommand(t.q as any).intent
      console.assert(got === t.intent, `parseCommand(${t.q}) → esperado: ${t.intent}, obtenido: ${got}`)
    }

    // Test: askSandra avisa cuando la URL no está configurada
    if (!getSandraUrl()) {
      askSandra('hola', 'es', {}).then(msg => {
        console.assert(/no está configurada|not configured/i.test(msg), 'askSandra debería avisar falta de config')
      })
    }

    console.groupEnd()
  } catch {}
}

if (isBrowser && isLikelyDev) {
  // retrasa para no interferir con la hidratación
  setTimeout(runDevTests, 0)
}
