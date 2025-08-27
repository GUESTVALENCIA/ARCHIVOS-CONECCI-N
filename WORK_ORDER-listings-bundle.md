# WORK ORDER — GV Listings Bundle (HTML + PayPal + Sandra)
**Date:** 2025-08-27 16:23

## Summary
Assemble four listing pages with uniform style, booking calculator, PayPal button (client ID placeholder), and Sandra widget (“Easy Payment / Pago Fácil”). Files come **separated** to keep chat light; Agent Code **assembles** into the repo per this spec.

## Repo & Branch (fill before run)
- **Repo URL:** `https://github.com/<org>/<repo>`
- **Target branch:** `feature/listings-bundle`
- **Base branch:** `main`

## File Manifest
- `public/listings/listing-cabanal.html`
- `public/listings/listing-mendez.html`  (template per habitación privada)
- `public/listings/listing-altea.html`
- `public/listings/listing-betera.html`

> Source of truth for full code: **Canvas** doc “Listings HTML – Cabañal, Méndez, Altea, Bétera (con reserva, cálculo, PayPal y widget Sandra)”. Copy each block into its corresponding path.

## Assets
Place hero images (replace with real photos):
- `/public/images/cabanal/hero.jpg`
- `/public/images/mendez/hero-room.jpg`
- `/public/images/altea/hero.jpg`
- `/public/images/betera/hero.jpg`

## Configuration
- **PayPal**: replace `CLIENT_ID_AQUI` with real Client ID; currency EUR.
- **Prices** (editable constants in each file):
  - Cabañal: `PRICE_PER_NIGHT = 120`
  - Méndez (habitación): `55`
  - Altea Hills (villa): `220`
  - Bétera: `85`
- **Fees** (in code): cleaning flat; service 5% of subtotal. Adjust as needed.
- **Widget Sandra**: floating FAB opens modal; copy present code. Text: “Sandra no ve tus datos de pago”.

## Acceptance Criteria
1. Each page loads standalone under `/public/listings/`.
2. Badges, hero, amenities grid render per design.
3. “Calcular precio” updates summary + total with nights × price + cleaning + service.
4. PayPal button appears **only** after cálculo (total set) and completes sandbox purchase flow.
5. Sandra modal opens/closes and displays language options (ES/EN).
6. Style consistent with Montanejos page (rounded, gradients, Inter font).

## QA Steps
- Open each HTML directly in browser; verify UI + mobile viewport.
- Test date selection edge cases (same-day, invalid range).
- Verify PayPal button renders and completes (use sandbox client id for dev).
- Lighthouse pass > 85 performance on desktop (non-blocking).

## Commit Message (template)
```
feat(listings): add Cabañal, Méndez (room), Altea Hills, Bétera pages with booking calc, PayPal and Sandra widget

- Uniform design + amenities
- Price calculator (nightly + cleaning + 5% service)
- PayPal button (client id placeholder)
- “Easy Payment / Pago Fácil” modal
```
## PR Title
`feat: listings bundle (Cabañal, Méndez, Altea, Bétera) — booking + PayPal + Sandra`

## PR Checklist
- [ ] Images added to `/public/images/...`
- [ ] Replace `CLIENT_ID_AQUI`
- [ ] Prices/fees validated
- [ ] i18n strings acceptable
- [ ] Self-review screenshots attached

## Rollback
Revert commit or `git revert <sha>`; pages are additive only (no destructive changes).