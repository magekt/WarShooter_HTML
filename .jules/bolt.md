# Bolt's Performance Journal

## 2026-09-25 - Avoid per-frame and per-shot object allocations in Three.js loop
**Learning:** Instantiating `THREE.Vector3`, `THREE.Raycaster`, or temporary array allocations inside `requestAnimationFrame` render loops or weapon `shoot()` routines triggers high Garbage Collection (GC) pressure and micro-stutters during high fire-rate sequences (e.g. shotgun pellets).
**Action:** Pre-allocate class-level private helper instances (`_raycaster`, `_shootDirection`, `_enemyDir`, `_enemyMeshes`) on class initialization and reset/reuse them in hot loops.
