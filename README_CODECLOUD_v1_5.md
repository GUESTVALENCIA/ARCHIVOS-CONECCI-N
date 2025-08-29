# Entrega CodeCloud — v1.5 (Stripe server + Webhook, PayWithAI, toasts & motion)

## Novedades clave
- **Stripe server-side**: `POST /api/stripe/create-checkout-session` (usa `STRIPE_PRICE_SERVICE` o `amount` en céntimos).
- **Stripe webhook**: `POST /api/stripe/webhook` — verifica firma y registra `checkout.session.completed`.
- **Botón “Pago Fácil con IA / Easy Payment with AI”**: `components/ui/PayWithAIButton.tsx`
  - Al hacer clic, **Sandra habla** (“Somos PropTech…”) y se inicia el checkout de Stripe para activar servicios.
- **Toaster global**: `components/ui/AppToaster.tsx` (requiere `react-hot-toast`).
- **Stripe client/server**: incluye además `StripeServerButton.tsx` para pagos server-side reutilizables.

## Instalación (terminal)
```bash
unzip GV_Entrega_CodeCloud_v1_5.zip -d .

# Dependencias
npm i stripe @stripe/stripe-js react-hot-toast

# Entorno
echo "STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXX" >> .env.local
echo "STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXX" >> .env.local
echo "NEXT_PUBLIC_SITE_URL=https://tusitio.com" >> .env.local
# Opcional: producto/precio en Stripe para activar servicios PropTech
echo "STRIPE_PRICE_SERVICE=price_XXXXXXXXXXXX" >> .env.local

# Commit & push
git add app/api/stripe components/checkout components/ui README_CODECLOUD_v1_5.md
git commit -m "feat(site): v1.5 Stripe server+webhook, PayWithAI, toasts"
git push
```

## Uso
- **Botón PayWithAI** donde quieras activar servicios (por ejemplo en /propietarios o /servicios):
```tsx
import dynamic from 'next/dynamic';
const PayWithAIButton = dynamic(() => import('@/components/ui/PayWithAIButton'), { ssr: false });

// ...
<PayWithAIButton />            // Español: “Pago Fácil con IA”
<PayWithAIButton english />    // Inglés: “Easy Payment with AI”
```
- **Toaster global** (opcional):
```tsx
// en app/(site)/layout.tsx
import AppToaster from '@/components/ui/AppToaster';
// dentro del body
<AppToaster />
```

## Producción
- Configura el **endpoint webhook de Stripe** a `/api/stripe/webhook` desde el Dashboard de Stripe.
- En PayPal (v1.4) configura su webhook también para sincronizar pagos.
- Persiste las órdenes y reservas en tu base de datos (en los TODO marcados).
