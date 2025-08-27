
# GuestsValencia · Comms Pack v2
Incluye:
- `listings.html` — catálogo de 9 alojamientos (desde `data/listings.json`)
- `checkout.html` — checkout simple con botón **Confirmar por WhatsApp**
- `admin/cleaning.html` — programación de limpieza con botones a Susana/Paloma (WhatsApp)
- `js/gv-config.js` — config centralizada de números y backend
- `css/gv-theme.css` — tema
- `assets/hero/*` — placeholders para fotos

## Instalación
```bash
scp guestsvalencia-comms-pack-v2.zip usuario@TU_SERVIDOR:/var/www/guestsvalencia/
ssh usuario@TU_SERVIDOR 'cd /var/www/guestsvalencia && unzip -o guestsvalencia-comms-pack-v2.zip'
```
Abre:
- `/listings.html`
- `/checkout.html?lid=cabanyal-3hab`
- `/admin/cleaning.html`

## Configurar números
Edita `js/gv-config.js`:
```js
WHATSAPP_MAIN: "+34624829117",
WHATSAPP_SUSANA: "+34611122334",
WHATSAPP_PALOMA: "+34622233445"
```
