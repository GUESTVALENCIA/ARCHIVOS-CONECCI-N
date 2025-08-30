# PATCH FINAL – Integración Sandra en tu diseño

Este parche **inyecta la sección de Sandra** dentro de tu `ibdex.html` sin alterar tu diseño.
Incluye además `config.js` con tus valores reales y un `overrides.css` anti-FAB.

## Archivos
- `ibdex.html` → tu archivo original con la sección Sandra insertada antes de `</footer>`
- `assets/js/config.js` → API_URL, API_KEY, AVATAR_IFRAME_URL y WhatsApp
- `assets/js/sandra.js` → cliente ligero (texto/voz/avatar)
- `assets/css/overrides.css` → ocultar FAB en caso de existir

## Cómo aplicar (CLI)
```bash
# copia los archivos a tu repo, respetando rutas
git add ibdex.html assets/js/config.js assets/js/sandra.js assets/css/overrides.css
git commit -m "feat(sandra): integrar sección Sandra en diseño oficial + config real"
git push
```

Al refrescar, verás tu web **idéntica** pero con la sección de Sandra (Texto, Voz, Avatar) funcionando.
