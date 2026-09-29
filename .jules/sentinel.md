## 2025-05-18 - Client-Side Save Data Sanitization
**Vulnerability:** Unsanitized data loaded directly from `localStorage` into application state could lead to state corruption or invalid state manipulation (e.g., negative/infinite coin values, non-existent fighting style references, non-numeric stat values).
**Learning:** Browser `localStorage` is untrusted input. Directly calling `JSON.parse()` on stored JSON strings without schema validation allows users or scripts to corrupt client application state.
**Prevention:** Always schema-validate, type-check, and bound-check numeric and string properties loaded from `localStorage` using default fallbacks before merging into application state.
