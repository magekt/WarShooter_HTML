# Palette's Journal - UX & Accessibility Learnings

## 2025-05-18 - Icon-Only Touch Action Buttons and Weapon Selectors
**Learning:** Icon-only action buttons in game overlays and HUD controls (like touch controls and weapon switchers) require explicit `aria-label` and `aria-pressed` / `aria-hidden` attributes for screen readers. Overriding buttons with existing visible text with `aria-label` can create confusion for voice control and screen readers.
**Action:** Always add accessible labels to icon-only interactive controls while leaving visible text labels intact.
