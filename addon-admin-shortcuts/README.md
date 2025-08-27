# GuestsValencia · Admin Shortcuts Addon

Añade tres accesos rápidos al panel admin:
- 👑 **Presidente** → `/admin/modes.html` (Modos & Memoria)
- 🧽 **Limpieza** → `/admin/cleaning.html`
- ✨ **Prompt Maestro** → abre el drawer del prompt en la **web pública** con `#openPrompt`

## Instalación
```bash
cd /var/www/guestsvalencia
unzip -o guestsvalencia-admin-shortcuts.zip
bash addon-admin-shortcuts/install-admin-shortcuts.sh
```

Si tu admin no tiene `<nav>`, el script intenta encontrar `.nav`, `header .actions` o `header .row`. 
Si no encuentra nada, no rompe nada: puedes añadir el snippet manual.

## Snippet manual (si prefieres pegarlo tú)
```html
<script src="/admin/shortcuts.js" defer></script>
```
