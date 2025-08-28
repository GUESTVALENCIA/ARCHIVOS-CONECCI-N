# GV Admin Override Addon

Desbloquea **voz + avatar** solo para administradores/propietarios sin depender de una reserva activa.

## Backend (secure+admin)
Usa `backend/realtime-webrtc-bridge.secure.admin.js` como entrypoint en lugar del secure normal.

### Variables de entorno
Añade a tu `.env`:
```
ADMIN_EMAILS=claytis33@gmail.com
ADMIN_OVERRIDE_CODE=<código_largo_y_secreto>
```
- `ADMIN_EMAILS`: lista de emails permitidos (separados por coma).
- `ADMIN_OVERRIDE_CODE`: código que debes introducir junto con el email para emitir el JWT admin (24h).

### Endpoint
```
POST /api/auth/admin-override
Body: { "email": "you@example.com", "code": "EL-CODIGO" }
Cookies: Set-Cookie: gv_session=...; HttpOnly; Secure; SameSite=Strict
```

## Frontend
Incluye la página oculta **/admin/unlock** y el componente `AdminUnlock`:
- Ruta: `pages/admin/unlock.tsx`
- Componente: `components/AdminUnlock.tsx`

Cuando completes el formulario, el backend colocará una cookie **HttpOnly** con `role=admin` y `tier=premium`. El UI recargará y `useVoiceEntitlement` debe dar acceso completo (si no lo hacía ya, asegúrate de tratar `role==='admin'` como full access).

## Consejos de seguridad
- Mantén `ADMIN_OVERRIDE_CODE` fuera del repo (solo en `.env` del servidor).
- Añade 2FA real en cuanto puedas (OTP/TOTP) o restringe IP si procede.
- No enlaces `/admin/unlock` en la navegación pública.
- Revoque acceso borrando cookie o rotando `JWT_SECRET` con el script del Security Addon.
