# Sandra · iOS Ad Hoc OTA Installer Kit

Este kit te permite **instalar tu .ipa en iPhone/iPad desde Safari** SOLO en dispositivos que estén **provisionados (UDID) en tu perfil Ad Hoc**. Requiere cuenta Apple Developer y hosting HTTPS.

---

## Paso 0 — Requisitos
- Apple Developer Program (pago).
- Certificado iOS Distribution.
- **Dispositivos registrados (UDID)** en tu cuenta (tú y familia).
- **Provisioning Profile (Ad Hoc)** para el bundle `es.guestsvalencia.sandra` incluyendo TODOS esos UDID.
- Un servidor **HTTPS** propio (Nginx recomendado) para alojar `index.html`, `manifest.plist`, `Sandra.ipa` e imágenes.

> Nota: Ad Hoc funciona SOLO con los UDID incluidos. Si falta un UDID, ese dispositivo no podrá instalar.

---

## Paso 1 — Exportar el .IPA
1. Abre el proyecto iOS (Xcode) de **SandraMobile**.
2. `Product > Archive` → `Distribute App` → **Ad Hoc**.
3. Selecciona el **Provisioning Profile (Ad Hoc)** que incluya todos los UDID.
4. Exporta y renombra a `Sandra.ipa`.

(Alternativa: si compilas con EAS, exporta IPA firmado Ad Hoc.)

---

## Paso 2 — Colocar archivos en tu servidor
Sube a una carpeta HTTPS, por ejemplo: `https://download.guestsvalencia.es/sandra/`

- `index.html`  ← Página con botón instalar.
- `manifest.plist`  ← Manifiesto OTA que apunta al IPA.
- `assets/icon57.png`, `assets/icon512.png` (opcional, ya incluidos).
- `Sandra.ipa`  ← Tu IPA firmado Ad Hoc.

---

## Paso 3 — Editar manifest.plist
Abre `manifest.plist` y reemplaza los marcadores:

- `__IPA_URL__` → URL completa al IPA (ej. `https://download.guestsvalencia.es/sandra/Sandra.ipa`)
- `__BUNDLE_ID__` → `es.guestsvalencia.sandra`
- `__BUNDLE_VERSION__` → `1.0.0` (o el que uses)
- `__TITLE__` → `Sandra`
- `__ICON57_URL__` → URL HTTPS al icono 57x57 (opcional)
- `__ICON512_URL__` → URL HTTPS al icono 512x512 (opcional)

También puedes usar el script:
```bash
export IPA_URL="https://download.guestsvalencia.es/sandra/Sandra.ipa"
export BUNDLE_ID="es.guestsvalencia.sandra"
export BUNDLE_VERSION="1.0.0"
export TITLE="Sandra"
export ICON57_URL="https://download.guestsvalencia.es/sandra/assets/icon57.png"
export ICON512_URL="https://download.guestsvalencia.es/sandra/assets/icon512.png"

./scripts/generate-manifest.sh > manifest.plist
```

---

## Paso 4 — Probar la instalación
1. En **iPhone**, abre **Safari** y visita `https://download.guestsvalencia.es/sandra/`.
2. Toca **“Instalar Sandra (Ad Hoc)”**.
3. Acepta el diálogo del sistema. La app aparecerá instalándose en el SpringBoard.

> Si NO se instala: revisa que ese iPhone esté en el **Provisioning Profile (UDID)** y que el IPA esté **firmado Ad Hoc** con ese perfil.

---

## Nginx (ejemplo)
Asegúrate de servir con HTTPS y permitir el esquema `itms-services` desde tu HTML.
No necesitas MIME especial si usas el enlace estándar (ver `index.html`).

---

## Seguridad / Privacidad
- La URL puede protegerse por **Basic Auth** o IP allowlist si quieres máxima privacidad.
- Evita indexado: agrega `X-Robots-Tag: noindex` y `robots.txt`.

---

## Archivos del kit
- `index.html` → Página de instalación con el enlace itms-services.
- `manifest.plist` → Plantilla del manifiesto OTA.
- `assets/icon57.png`, `assets/icon512.png` → Placeholders.
- `scripts/generate-manifest.sh` → Script para generar el manifest con variables de entorno.

Con cariño 💙 — listo para que solo tú y tu familia instaléis **Sandra** sin pasar por App Store.
