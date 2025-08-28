# Heian PWA — Next.js Pack

Este paquete integra PWA + gating (voz/avatar) para GuestsValencia.

## Archivos clave
- `next.config.js` → headers correctos para manifest y SW
- `public/manifest.webmanifest`, `public/service-worker.js`, `public/register-sw.js`
- `public/assets/` → iconos PWA (192/512 + Apple 180)
- `pages/_document.tsx`, `pages/_app.tsx`
- `pages/app/heian.tsx` → página base
- `hooks/useVoiceEntitlement.ts` → gating por JWT y tier
- `lib/realtime.ts` → handshake WebRTC (token efímero)
- `components/InstallPWAButton.tsx`, `components/ChatWidget.tsx`

## Instrucciones
1) Copia `public/` y estos archivos a tu Next.js.
2) Asegúrate de servir HTTPS tras Nginx.
3) Coloca el JWT en `localStorage.setItem('gv.jwt', token)` al logear al huésped.
4) Ajusta estilos a tu branding (Tailwind opcional).
