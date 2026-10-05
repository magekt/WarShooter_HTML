# Palette Journal - Critical UX & Accessibility Learnings

## 2025-05-18 - HUD and Touch Controls Accessibility
**Learning:** HTML/SVG overlay HUDs and touch action buttons in 3D WebGL games frequently lack accessible labels and semantics. Icon-only action controls (fire, jump, reload) require explicit `aria-label` attributes for screen readers, and meter bars (health, armor) should use `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` attributes to communicate real-time status effectively.
**Action:** Always verify overlay buttons and visual progress meters in web canvas/game interfaces have proper ARIA attributes (`aria-label`, `aria-pressed`, `role="progressbar"`).
