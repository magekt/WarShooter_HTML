## 2025-05-18 - HUD Accessibility & Keyboard Focus in Canvas Games
**Learning:** React HUD overlays on top of WebGL/3D canvases often lack ARIA progress bar semantics and focus indicators because overlay components are built as pointer-transparent containers.
**Action:** Always add explicit `role="progressbar"`, `aria-valuenow`, `aria-pressed`, and `:focus-visible` styles on interactive overlay HUD elements.
