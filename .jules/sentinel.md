# Sentinel Security Journal

## 2025-05-18 - LocalStorage Unsanitized Deserialization & Prototype Lookup
**Vulnerability:** Saved game progression state from `localStorage` was parsed directly via `JSON.parse` into application state without structural schema validation or boundary checks, allowing prototype lookup hazards (`__proto__`) and state corruption.
**Learning:** Checking property existence using `obj[key]` on plain JS objects can match inherited prototype properties like `__proto__`.
**Prevention:** Always use `Object.prototype.hasOwnProperty.call(obj, key)` or `Object.hasOwn(obj, key)` when validating untrusted keys against a lookup map, and sanitize numeric bounds after deserializing `localStorage` data.
