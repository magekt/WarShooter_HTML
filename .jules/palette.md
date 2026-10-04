## 2025-05-18 - HUD & Touch Controls Accessibility
**Learning:** Game HUD progress bars (Health, Armor) and icon-only touch controls require explicit ARIA attributes (`role="progressbar"`, `aria-valuenow`, `aria-label`, `aria-pressed`) to ensure proper screen reader support in canvas/overlay games.
**Action:** Always wrap visual progress indicators and icon buttons with accessible ARIA semantics and label decorative icons with `aria-hidden="true"`.
