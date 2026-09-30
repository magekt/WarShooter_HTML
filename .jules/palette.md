## 2025-05-18 - Accessibility Improvements for HUD and Touch Controls
**Learning:** Icon-only buttons and graphical progress bars (health/armor meters) in game HUD overlay components must include explicit ARIA accessibility attributes (`role="progressbar"`, `aria-label`, `aria-valuenow`, `aria-pressed`, `aria-hidden`) so screen readers can accurately interpret game state and control elements.
**Action:** Always add proper ARIA progressbar roles and accessibility labels to HUD components and virtual touch control buttons.
