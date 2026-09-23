# Sentinel's Journal

## 2026-09-23 - Safe Save Data Parsing and Validation
**Vulnerability:** Untrusted save data from `localStorage` loaded into state without input validation, type checking, or fallback integrity checks.
**Learning:** `JSON.parse` outputs arbitrary objects/primitives, which can cause state corruption or NaN values if tampered with or corrupted in client storage.
**Prevention:** Validate types, ensure numerical ranges are valid non-negative numbers, and fall back to default state values when parsing structured storage.
