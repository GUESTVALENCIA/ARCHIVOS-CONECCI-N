# Entrega CodeCloud — v1.1 (metadata + botón WhatsApp flotante)

Este paquete añade:
- `export const metadata` en **/propietarios** y **/servicios** (SEO listo).
- Componente **WhatsAppFloat** para botón flotante en todo el sitio.

## Estructura
```
app/
  (site)/
    propietarios/page.tsx
    servicios/page.tsx
components/
  ui/WhatsAppFloat.tsx
```

## Instalación (terminal)
```bash
unzip GV_Entrega_CodeCloud_v1_1.zip -d .

# Si tu layout ya existe en app/(site)/layout.tsx, ábrelo y añade el botón:
# 1) Importa el componente
# import WhatsAppFloat from '@/components/ui/WhatsAppFloat';

# 2) Dentro del body/layout, justo antes de cerrar, añade:
# <WhatsAppFloat />

# 3) (Opcional) Define el teléfono en .env.local
# NEXT_PUBLIC_WA_PHONE=34600000000

# Commit y push
git add app/(site)/propietarios/page.tsx app/(site)/servicios/page.tsx components/ui/WhatsAppFloat.tsx
git commit -m "feat(site): metadata + botón WhatsApp flotante (v1.1)"
git push
```

## Notas
- Sustituye títulos/descripciones de metadata si tu equipo de SEO lo requiere.
- El botón usa `NEXT_PUBLIC_WA_PHONE` si existe; si no, cae al número por defecto.
