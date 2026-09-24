## 2026-09-22 - Untrusted localStorage Save Data Sanitization
**Vulnerability:** Untrusted or corrupted JSON in `localStorage` (`WARZONE_PROGRESSION_SAVE_V1`) could corrupt progression state with `NaN`, invalid enum keys, or non-finite numbers.
**Learning:** Client-side state loaded directly from `localStorage` without validation allows trivial client manipulation or app crash if corrupted.
**Prevention:** Always validate and sanitize all loaded storage objects through a schema/bounds validator prior to applying state updates.
