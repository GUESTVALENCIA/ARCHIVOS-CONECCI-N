# Admin Global Hotkey Addon

## Qué hace
- **Atajo universal** `Ctrl+Shift+U` → abre el **Admin Unlock Modal** en **cualquier página** (no visible al público).
- **Modal** `AdminUnlockModal` → te autentica como **admin premium** con email whitelisted + código secreto (cookie HttpOnly).
- **Instrucciones Sandra** en Realtime → adiós a mensajes predeterminados y lemas repetidos.

## Integración (Frontend)
1. Copia a tu repo:
   - `frontend/components/AdminUnlockModal.tsx`
   - `frontend/hooks/useAdminUnlockHotkey.ts`
2. En `pages/_app.tsx`, añade el bloque del archivo `_app.patch.txt` (import dinámico del modal + hook del hotkey).

## Integración (Backend)
- Si usas `realtime-webrtc-bridge.secure.admin.js`, aplica el parche del archivo:
  - `backend/realtime-session.patch.txt` → añade el campo **instructions** en el body de `/v1/realtime/sessions`.

## Consejo
- Mantén `ADMIN_EMAILS` y `ADMIN_OVERRIDE_CODE` sólo en el `.env` del servidor.
- Si quieres, cambiamos el hotkey; también puedo añadir gesto táctil oculto en PWA (triple tap en logo) sólo para admin.
