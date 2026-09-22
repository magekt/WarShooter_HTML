# Palette's Journal - Critical UX Learnings

## 2025-02-22 - HTML5 Canvas & Custom UI Accessibility
**Learning:** Pure canvas/custom HTML game controls often lack default keyboard focus indicators and ARIA attributes for screen readers (e.g. D-pad arrow buttons and health bars). Adding explicit ARIA labels, `role="button"`, `tabindex="0"`, and custom `:focus-visible` styling dramatically improves accessibility without altering performance or visual design for standard touch/mouse users.
**Action:** Always provide explicit ARIA roles/labels and `:focus-visible` ring styles for custom div-based touch/game controls.
