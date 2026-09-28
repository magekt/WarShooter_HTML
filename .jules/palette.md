# Palette's Journal - Warshooter HTML

## 2025-05-18 - HUD & Touch Controls Accessibility Improvements
**Learning:** Icon buttons without `aria-label` and `aria-pressed` or `aria-valuenow` attributes impair accessibility for screen reader users and users navigating with assistive tools in HUD and touch overlays. Adding proper ARIA attributes and focus styles ensures seamless keyboard/assistive navigation without disrupting action-packed UI styling.
**Action:** Always add explicit `aria-label` and interactive state ARIA attributes (such as `aria-pressed`, `aria-valuenow`) to icon buttons and custom controls in game UI components.
