# Entrega CodeCloud — v1.2 (SEO extendido + WA dinámico + Contacto con schema.org)

## Novedades
- **SEO extendido** en `/propietarios`, `/servicios`, `/contacto` (OpenGraph + Twitter + canonical + robots).
- **Imagen OG placeholder**: `public/images/og-default.svg` (1200×630).
- **Botón WhatsApp flotante** reutilizable con mensaje **dinámico por página**.
- **/contacto** con formulario básico y **JSON‑LD ContactPage**.

## Estructura
```
app/
  (site)/
    propietarios/page.tsx
    servicios/page.tsx
    contacto/page.tsx
components/
  ui/WhatsAppFloat.tsx
public/
  images/og-default.svg
```

## Instalación (terminal)
```bash
unzip GV_Entrega_CodeCloud_v1_2.zip -d .

# Importar botón en el layout (si aún no está):
# app/(site)/layout.tsx
# import WhatsAppFloat from '@/components/ui/WhatsAppFloat';
# <WhatsAppFloat />  // puedes omitirlo si lo usas por-página con prop text

# Entorno
echo "NEXT_PUBLIC_WA_PHONE=34600000000" >> .env.local

# Commit & push
git add app/(site)/propietarios/page.tsx app/(site)/servicios/page.tsx app/(site)/contacto/page.tsx components/ui/WhatsAppFloat.tsx public/images/og-default.svg
git commit -m "feat(site): v1.2 SEO+OG, WA dinámico y Contacto con schema.org"
git push
```

## Personalización rápida
- Sustituye `NEXT_PUBLIC_WA_PHONE` por el número real.
- Cambia `og-default.svg` por tu imagen de marca (1200×630).
- Ajusta titles/descriptions si tu equipo SEO lo requiere.
