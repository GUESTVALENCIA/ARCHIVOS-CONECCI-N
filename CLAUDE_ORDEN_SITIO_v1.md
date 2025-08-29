# 🛠️ ORDEN MAESTRA PARA CLAUDE CODE
**Proyecto:** GuestsValencia / Sandra Protech Site  
**Objetivo:** Pasar de “one‑page” a **sitio multipágina listo para vender servicios** este fin de semana.  
**Regla nº1:** Mantener el **diseño visual actual** (colores, tipografías, componentes) y **rellenar con contenido placeholder realista** para editar luego.
**Stack asumido (ajústalo si tu repo usa otro):** Next.js 14 (App Router) + Tailwind + TypeScript.  
*(Si tu stack es distinto, respeta las rutas y componentes abajo.)*

---

## 0) Tareas base (una sola vez)
1. **Crear rutas y layout comunes**
   - `app/(site)/layout.tsx` con Header, Footer, `Providers`, meta por defecto (OG, favicon, etc.).
   - Componentes base en `components/ui/`:
     - `Header.tsx` (logo, menú, CTA “Reserva” + “WhatsApp”)
     - `Footer.tsx` (links útiles, redes, legal)
     - `Hero.tsx`, `Section.tsx`, `FeatureCard.tsx`, `Testimonial.tsx`
     - `BookingWidget.tsx` *(placeholder, sin backend)*
     - `AudioHint.tsx` *(botón para reproducir audio de Sandra)*
   - Utilidades: `lib/analytics.ts`, `lib/seo.ts`, `lib/i18n.ts` (ES por defecto, estructura lista para EN/FR/VA/DE).

2. **Estilos**
   - Mantener `tailwind.config.js` del proyecto y tokens actuales. Añadir utilidades leves si faltan (`container`, `shadow`, `rounded-2xl`).

3. **Contenido y assets fake**
   - Carpeta `public/media/audio/{es,en,fr,va,de}/` con archivos **dummy** `faq-checkin.mp3`, `faq-transporte.mp3`, `faq-clima.mp3`.
   - Carpeta `public/media/video/{es,en,fr,va,de}/` con `*.mp4` **dummy**.
   - Imágenes placeholder en `public/images/` (alojamientos, mapas, mockups). Usa nombres reales: `altea-hills.jpg`, `mendez-nunez.jpg`, `montanejos.jpg`.
   - Cargar `robots.txt` y `sitemap.xml` básicos.

4. **Datos de ejemplo (para tarjetas y fichas)**
   - `content/listings.json`
   - `content/services.json`
   - `content/faq-multimedia.json` *(clave: tema + idioma → rutas audio/video)*

---

## 1) Mapa de sitio (rutas)
- `/` → **Inicio** (hero + CTA + servicios destacados + alojamientos destacados + testimonios + “Cómo funciona”)
- `/servicios` → **Servicios PropTech & Gestión** (paquetes, precios, diferenciales)
- `/alojamientos` → **Listado de alojamientos** (grid con filtros simples)
- `/alojamientos/[slug]` → **Ficha de alojamiento** (galería, detalles, booking widget placeholder)
- `/propietarios` → **Para propietarios** (captación, flujo y propuesta de valor)
- `/sobre-nosotros` → **Quiénes somos** (misión, 7 estrellas, IA Sandra)
- `/contacto` → **Contacto / Reservar** (formulario + WhatsApp + mapa)
- `/faq` → **FAQ multimedia** (texto + audio/video por idioma)
- `/legal/privacidad`, `/legal/terminos` → **Legal**

---

## 2) Contenido FAKE (realista) por página

### 2.1) `/` Inicio
**Hero**
- Título: “Estancias memorables en Valencia, Montanejos y Altea Hills”
- Subtítulo: “Gestión 7★ con IA Sandra: check‑in autónomo, asistencia 24/7 y experiencias locales.”
- CTAs: “Ver alojamientos”, “Hablar por WhatsApp”

**Bloque Servicios (3‑5 tarjetas)**
- “Recepción 7★ con IA Sandra” — “Atención en ES/EN/FR/VA/DE, voz y video.”
- “Llegada 100% autónoma” — “Códigos digitales y cajas de seguridad.”
- “Plan de llegada” — “Rutas y horarios personalizados antes de tu viaje.”
- “Bienestar incluido” — “Mindfulness, yoga o pilates según tu plan.”

**Destacados Alojamientos (3 cards)**
- Altea Hills — 2 hab, hasta 6 pax, vistas al mar, piscina comunitaria.
- Méndez Núñez 47 — 4 habitaciones en apartamento amplio, centro Valencia.
- Dúplex Montanejos — Acceso incluido a Fuente de los Baños.

**Cómo funciona (3 pasos)**
1) Reserva online, 2) Check‑in autónomo, 3) Disfruta con la guía de Sandra.

**Testimonios (fake realistas)**
- “La guía de llegada nos ahorró 1 hora.” — Laura, FR
- “El check‑in fue instantáneo y sin llaves.” — Diego, ES

---

### 2.2) `/servicios`
**Intro:** “Suite PropTech & Gestión integral”  
**Paquetes (tabla/planes):**
- **Starter**: Publicación, mensajes básicos, limpieza coordinada.
- **Pro**: + Dinámica de precios, campañas sociales, FAQ multimedia.
- **VIP**: + Atención voz/video con Sandra, bienestar diario, acuerdos locales.
**Diferenciales:** sin comisiones de OTAs en web propia, negociación en tiempo real, captación de propietarios.

---

### 2.3) `/alojamientos`
- Filtros: zona (Valencia, Montanejos, Altea), huéspedes, precio aproximado.
- Cards hidratadas con `content/listings.json` (nombre, foto, 3 bullets, botón “Ver ficha”).

**`content/listings.json` ejemplo:**
```json
[
  {
    "slug": "altea-hills-vista-mar",
    "title": "Altea Hills · Vista al mar",
    "location": "Altea Hills (Alicante)",
    "capacity": 6,
    "beds": "2 hab + supletorias",
    "highlights": ["Piscina comunitaria", "Terraza y barbacoa", "Vistas panorámicas"],
    "image": "/images/altea-hills.jpg",
    "price_hint": "200–300 €/noche"
  },
  {
    "slug": "valencia-mendez-nunez-47",
    "title": "Valencia · Méndez Núñez 47",
    "location": "Centro de Valencia",
    "capacity": 4,
    "beds": "4 habitaciones",
    "highlights": ["Llegada autónoma", "WiFi + streaming", "Cocina equipada"],
    "image": "/images/mendez-nunez.jpg",
    "price_hint": "45–70 €/hab/noche"
  },
  {
    "slug": "montanejos-duplex-termal",
    "title": "Montanejos · Dúplex termal",
    "location": "Montanejos",
    "capacity": 5,
    "beds": "Dúplex 2 niveles",
    "highlights": ["Acceso Fuente de los Baños", "Smart lock", "Rutas de montaña"],
    "image": "/images/montanejos.jpg",
    "price_hint": "120–180 €/noche"
  }
]
```

---

### 2.4) `/alojamientos/[slug]` (Plantilla)
- **Hero con galería** (3–6 fotos).
- **Datos clave**: capacidad, camas, WiFi/streaming, parking (si aplica), normas, silencio.
- **Bloque “Llegada autónoma”**: tipo de acceso (caja seguridad / smart lock).
- **Mapa** (placeholder iframe).
- **Widget Reserva (placeholder)**: fechas, huéspedes, botón “Solicitar reserva” => `mailto:` o WhatsApp con mensaje preformateado.
- **Bloque “Experiencia Sandra”**: audio botón (`AudioHint`) con mensaje de bienvenida según idioma.
- **CTA secundaria**: “Pedir plan de llegada” (abre formulario modal).

---

### 2.5) `/propietarios`
- **Propuesta de valor**: “Ingresos sin preocupaciones. Nosotros lo gestionamos todo.”
- **Cómo trabajamos**: publicación, atención 7★, mantenimiento, pricing, campañas.
- **Modelo**: comisión sobre reservas + ahorro por venta directa en web propia.
- **CTA**: “Solicitar valoración gratuita” (formulario).

---

### 2.6) `/sobre-nosotros`
- Misión: tecnología + hospitalidad humana.
- Sandra IA: recepcionista 7★ (multilenguaje, voz, video, bienestar).
- Zonas: Valencia, Montanejos, Altea.
- Fotos equipo/zonas (placeholder).

---

### 2.7) `/contacto`
- Formulario (nombre, email, motivo: reserva/propietario/soporte, mensaje).
- Botón WhatsApp con `?text=` prellenado.
- Dirección operativa en Valencia (placeholder) + horario de silencio para huéspedes.

---

### 2.8) `/faq`
- Listado de temas: Clima, Transporte, Check‑in…
- Cada tema: texto base + botones **Audio/Video** por idioma.  
- Fuente: `content/faq-multimedia.json`

**`content/faq-multimedia.json` ejemplo:**
```json
[
  {
    "topic": "checkin",
    "text": {
      "es": "Tu llegada es 100% autónoma. Te enviaremos el código el día de entrada…",
      "en": "Your arrival is fully self check‑in…",
      "fr": "Votre arrivée est en libre-service…",
      "va": "L’arribada és 100% autònoma…",
      "de": "Ihre Ankunft ist komplett Self Check‑in…"
    },
    "audio": {
      "es": "/media/audio/es/faq-checkin.mp3",
      "en": "/media/audio/en/faq-checkin.mp3",
      "fr": "/media/audio/fr/faq-checkin.mp3",
      "va": "/media/audio/va/faq-checkin.mp3",
      "de": "/media/audio/de/faq-checkin.mp3"
    },
    "video": {
      "es": "/media/video/es/faq-checkin.mp4",
      "en": "/media/video/en/faq-checkin.mp4",
      "fr": "/media/video/fr/faq-checkin.mp4",
      "va": "/media/video/va/faq-checkin.mp4",
      "de": "/media/video/de/faq-checkin.mp4"
    }
  }
]
```

---

### 2.9) Legal
- Páginas estáticas con texto placeholder conforme RGPD y condiciones de uso.

---

## 3) Componentes clave (pseudo-API)
**`BookingWidget.tsx` (placeholder)**
- Props: `listingId`, `title`
- Campos: fechas (date range), huéspedes, botón “Solicitar”
- Acción: `mailto:reservas@guestsvlc.fake?subject=Reserva {title}&body=…` o deep‑link WhatsApp

**`AudioHint.tsx`**
- Prop: `src` → reproduce un `audio` HTML5 con un botón accesible (play/pause).
- Variante: si no hay `src`, botón deshabilitado.

---

## 4) Tareas para Claude (comandos)
Copia/pega estas instrucciones **en orden**:

### 4.1 Scaffold y rutas
1) **Crear rutas y layout**  
“Crea en `app/(site)/` las rutas: `/`, `/servicios`, `/alojamientos`, `/alojamientos/[slug]`, `/propietarios`, `/sobre-nosotros`, `/contacto`, `/faq`, `/legal/privacidad`, `/legal/terminos`. Usa el layout común con `Header` y `Footer` en `app/(site)/layout.tsx` y mete metadatos básicos en `metadata` del App Router.”

2) **Componentes UI**  
“Genera en `components/ui/` los componentes: `Header`, `Footer`, `Hero`, `Section`, `FeatureCard`, `Testimonial`, `BookingWidget`, `AudioHint`. Todos con Tailwind, diseño limpio, responsive. Mantén el estilo actual del proyecto (clases y tokens existentes).”

3) **Contenido y JSONs**  
“Crea `content/listings.json`, `content/services.json`, `content/faq-multimedia.json` con los ejemplos de este documento. Asegúrate de que `/alojamientos` hidrata cards desde `listings.json` y `/faq` lee `faq-multimedia.json`.”

4) **Assets y media**  
“Crea la estructura `public/media/{audio,video}/{es,en,fr,va,de}/` con archivos dummy (vacíos o pequeños) y `public/images/` para las portadas `altea-hills.jpg`, `mendez-nunez.jpg`, `montanejos.jpg` (placeholders).”

### 4.2 Páginas y contenido fake
5) **`/` Inicio**  
“Implementa los bloques del punto 2.1 con copy placeholder EXACTO del documento.”

6) **`/servicios`**  
“Implementa planes Starter/Pro/VIP en cards o tabla, más diferenciales, usando contenido del punto 2.2.”

7) **`/alojamientos`**  
“Grid con filtros simples (zona, pax). Cards desde `listings.json` (imagen, título, 3 bullets, ‘Ver ficha’).”

8) **`/alojamientos/[slug]`**  
“Página dinámica que consume `listings.json` por `slug`. Galería (usa `next/image`), datos, bloque ‘Llegada autónoma’, mapa iframe, `BookingWidget` (mailto / WhatsApp), `AudioHint` con audio ES si existe.”

9) **`/propietarios`**  
“Crear según 2.5 con CTA ‘Solicitar valoración’ (formulario).”

10) **`/sobre-nosotros`**  
“Crear según 2.6.”

11) **`/contacto`**  
“Form con validación básica + botón WhatsApp con `?text=` prellenado (en ES).”

12) **`/faq`**  
“Lista de temas; cada ítem muestra texto y botones Audio/Video para el idioma actual (solo ES en esta fase). Usa `AudioHint` para reproducir audio.”

13) **`/legal/*`**  
“Textos placeholder. Estructura legible y accesible.”

### 4.3 Extras útiles para este fin de semana
14) **WhatsApp sticky CTA**  
“Añade un botón flotante ‘Hablar por WhatsApp’ en todas las páginas (componente dentro del layout).”

15) **SEO básico**  
“Define metadata por página con `export const metadata`. OG: título, descripción, imagen genérica. Añade `sitemap.xml` y `robots.txt` mínimos.”

16) **Analytics**  
“Inserta `lib/analytics.ts` y llama a `pageview()` en el layout si ya hay proveedor. Si no, deja placeholder.”

17) **Enrutado i18n listo (sin traducir aún)**  
“Configura `lib/i18n.ts` con ES por defecto y claves preparadas para EN/FR/VA/DE.”

---

## 5) QA checklist (antes de publicar)
- Navegación entre todas las rutas sin 404.
- `listings.json` renderiza en listado y ficha por `slug`.
- Botones: **Reserva**, **WhatsApp**, CTA propietarios funcionan (mailto/deeplink).
- Audio FAQ reproduce y no bloquea navegación móvil.
- Responsive móvil/tablet/desktop.
- Lighthouse: performance y accesibilidad ≥ 85.

---

## 6) Entregables de Claude
- PR con todas las rutas, componentes y JSONs.
- Instrucciones de build y `ENV` si aplican.
- Demo local: `pnpm dev` o `npm run dev`.

---

### Nota final
Todo el copy es **placeholder realista**. Mañana lo reemplazamos por el contenido final sin tocar el diseño. Mantén el estilo visual existente del proyecto.
