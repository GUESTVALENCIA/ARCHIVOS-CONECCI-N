# Entrega CodeCloud — GV Propietarios & Servicios (v1)

Este paquete contiene **dos páginas listas** para integrar en un proyecto Next.js (App Router) con Tailwind.

## Estructura
```
app/
  (site)/
    propietarios/
      page.tsx
    servicios/
      page.tsx
```

## Requisitos
- Next.js 13/14 con App Router
- Tailwind configurado
- Layout base con `container` y tokens estándar

## Instrucciones (Terminal)
```bash
# Copia las carpetas en tu repo (posición recomendada: app/(site)/...)
cp -R app/(site)/propietarios app/(site)/servicios /ruta/a/tu/repo/app/(site)/

# O usando git desde la raíz del repo
mkdir -p app/(site)/propietarios app/(site)/servicios
cp app/(site)/propietarios/page.tsx app/(site)/propietarios/page.tsx
cp app/(site)/servicios/page.tsx app/(site)/servicios/page.tsx

# Arranca en local
npm run dev
# o
pnpm dev

# Revisa: /propietarios y /servicios
```

## Ajustes a personalizar
- Sustituir números de WhatsApp en los CTAs.
- Alinear tipografías/colores con el theme del proyecto (las clases son genéricas).
- Añadir `export const metadata` en cada página si el proyecto lo usa para SEO.
