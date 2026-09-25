# Bolt's Journal - Critical Learnings Only

## 2026-09-25 - Pre-allocation & Squared Distance Operations in Three.js Engine Loops
**Learning:** Instantiating `THREE.Vector3`, `THREE.Euler`, and `THREE.Raycaster` inside 60FPS tick methods (`updatePlayer`, `updateEnemies`) or firing loops (`shoot`) introduces frequent garbage collection pauses and frame drops. Replacing `distanceTo` with `distanceToSquared` avoids unnecessary `Math.sqrt` operations per entity per frame. Furthermore, attaching `userData` references to Three.js meshes enables O(1) hit lookup during raycasting instead of searching enemy arrays.
**Action:** Always pre-allocate reusable Three.js math objects in class constructors, use `distanceToSquared` for proximity checks, and utilize `userData` for fast entity resolution.
