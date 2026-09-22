import * as THREE from 'three';
import { WEAPONS } from './WeaponManager';
import { soundManager } from './AudioSystem';

export class GameEngine {
  constructor(container, onStateUpdate) {
    this.container = container;
    this.onStateUpdate = onStateUpdate;

    // Game state
    this.isRunning = false;
    this.isPaused = false;
    this.score = 0;
    this.kills = 0;
    this.wave = 1;
    this.waveStatus = 'Ready';
    this.enemiesRemaining = 0;
    this.doubleDamageTimer = 0;

    // Player state
    this.player = {
      health: 100,
      maxHealth: 100,
      armor: 50,
      maxArmor: 100,
      position: new THREE.Vector3(0, 1.6, 0),
      velocity: new THREE.Vector3(),
      isGrounded: true,
      currentWeaponKey: 'rifle',
      weapons: JSON.parse(JSON.stringify(WEAPONS)),
      isReloading: false,
      reloadingProgress: 0, // 0-100
      lastShotTime: 0
    };

    // Controls input state
    this.input = {
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      jump: false,
      shoot: false,
      virtualMove: { x: 0, y: 0 },
      virtualLook: { x: 0, y: 0 }
    };

    // Camera look angles
    this.yaw = 0;
    this.pitch = 0;

    // Entities
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.powerups = [];
    this.obstacles = [];

    // Animation / Clock
    this.clock = new THREE.Clock();
    this.animationFrameId = null;

    // Init Three Scene
    this.initScene();
    this.bindEvents();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e17);
    this.scene.fog = new THREE.FogExp2(0x0a0e17, 0.015);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.copy(this.player.position);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x384152, 1.2);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5ea, 1.5);
    dirLight.position.set(30, 50, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 150;
    const d = 40;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    this.scene.add(dirLight);

    // Point lights for sci-fi arena vibe
    const redLight = new THREE.PointLight(0xef4444, 2, 30);
    redLight.position.set(-25, 5, -25);
    this.scene.add(redLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 2, 30);
    blueLight.position.set(25, 5, 25);
    this.scene.add(blueLight);

    // Build Arena Environment
    this.createArena();

    // Weapon mesh container connected to camera
    this.createFPSWeapon();
  }

  createArena() {
    const arenaSize = 80;

    // Floor with grid grid texture styling
    const floorGeo = new THREE.PlaneGeometry(arenaSize, arenaSize, 32, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Outer Walls
    const wallHeight = 10;
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      metalness: 0.5
    });

    const wallGeos = [
      { size: [arenaSize, wallHeight, 1], pos: [0, wallHeight / 2, -arenaSize / 2] },
      { size: [arenaSize, wallHeight, 1], pos: [0, wallHeight / 2, arenaSize / 2] },
      { size: [1, wallHeight, arenaSize], pos: [-arenaSize / 2, wallHeight / 2, 0] },
      { size: [1, wallHeight, arenaSize], pos: [arenaSize / 2, wallHeight / 2, 0] }
    ];

    wallGeos.forEach(w => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(...w.size), wallMat);
      wall.position.set(...w.pos);
      wall.receiveShadow = true;
      wall.castShadow = true;
      this.scene.add(wall);
      this.obstacles.push(new THREE.Box3().setFromObject(wall));
    });

    // Inner Obstacles / Covers
    const obstacleGeos = [
      { size: [4, 4, 4], pos: [-15, 2, -15] },
      { size: [6, 3, 2], pos: [10, 1.5, -20] },
      { size: [2, 5, 8], pos: [-20, 2.5, 10] },
      { size: [5, 4, 5], pos: [15, 2, 15] },
      { size: [8, 3, 3], pos: [0, 1.5, -5] },
      { size: [3, 4, 6], pos: [5, 2, 20] },
      { size: [4, 6, 4], pos: [-10, 3, 22] }
    ];

    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.4,
      metalness: 0.6
    });

    obstacleGeos.forEach(o => {
      const box = new THREE.Mesh(new THREE.BoxGeometry(...o.size), boxMat);
      box.position.set(...o.pos);
      box.castShadow = true;
      box.receiveShadow = true;
      this.scene.add(box);

      // Add a glowing trim line on obstacles
      const wireGeo = new THREE.EdgesGeometry(box.geometry);
      const wireMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
      const wire = new THREE.LineSegments(wireGeo, wireMat);
      box.add(wire);

      this.obstacles.push(new THREE.Box3().setFromObject(box));
    });
  }

  createFPSWeapon() {
    this.weaponGroup = new THREE.Group();
    
    // Gun Body
    const gunBodyGeo = new THREE.BoxGeometry(0.12, 0.15, 0.5);
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const gunBody = new THREE.Mesh(gunBodyGeo, gunMat);
    gunBody.position.set(0, 0, 0);

    // Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.4);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.9, roughness: 0.1 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.03, -0.3);

    // Magazine
    const magGeo = new THREE.BoxGeometry(0.08, 0.25, 0.1);
    const magMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const mag = new THREE.Mesh(magGeo, magMat);
    mag.position.set(0, -0.12, 0.05);

    this.weaponGroup.add(gunBody, barrel, mag);
    this.weaponGroup.position.set(0.25, -0.22, -0.4);
    this.camera.add(this.weaponGroup);
    this.scene.add(this.camera);
  }

  bindEvents() {
    this.handleKeyDown = (e) => {
      if (this.isPaused) return;
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.input.moveForward = true; break;
        case 'KeyS': case 'ArrowDown': this.input.moveBackward = true; break;
        case 'KeyA': case 'ArrowLeft': this.input.moveLeft = true; break;
        case 'KeyD': case 'ArrowRight': this.input.moveRight = true; break;
        case 'Space': 
          if (this.player.isGrounded) {
            this.player.velocity.y = 7.5;
            this.player.isGrounded = false;
          }
          break;
        case 'KeyR': this.reload(); break;
        case 'Digit1': this.switchWeapon('pistol'); break;
        case 'Digit2': this.switchWeapon('rifle'); break;
        case 'Digit3': this.switchWeapon('shotgun'); break;
      }
    };

    this.handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.input.moveForward = false; break;
        case 'KeyS': case 'ArrowDown': this.input.moveBackward = false; break;
        case 'KeyA': case 'ArrowLeft': this.input.moveLeft = false; break;
        case 'KeyD': case 'ArrowRight': this.input.moveRight = false; break;
      }
    };

    this.handleMouseMove = (e) => {
      if (document.pointerLockElement === this.container || document.pointerLockElement === this.renderer.domElement) {
        const sensitivity = 0.0022;
        this.yaw -= e.movementX * sensitivity;
        this.pitch -= e.movementY * sensitivity;
        this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));
      }
    };

    this.handleMouseDown = (e) => {
      if (e.button === 0) {
        soundManager.init();
        if (document.pointerLockElement !== this.renderer.domElement && !('ontouchstart' in window)) {
          this.renderer.domElement.requestPointerLock();
        }
        this.input.shoot = true;
      }
    };

    this.handleMouseUp = (e) => {
      if (e.button === 0) this.input.shoot = false;
    };

    this.handleResize = () => {
      if (!this.container) return;
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    };

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('resize', this.handleResize);
  }

  setVirtualJoystick(x, y) {
    this.input.virtualMove.x = x;
    this.input.virtualMove.y = y;
  }

  handleTouchLook(deltaX, deltaY) {
    const sensitivity = 0.004;
    this.yaw -= deltaX * sensitivity;
    this.pitch -= deltaY * sensitivity;
    this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));
  }

  switchWeapon(key) {
    if (this.player.weapons[key] && this.player.currentWeaponKey !== key) {
      this.player.currentWeaponKey = key;
      this.player.isReloading = false;
      this.notifyState();
    }
  }

  reload() {
    const currentWeapon = this.player.weapons[this.player.currentWeaponKey];
    if (this.player.isReloading || currentWeapon.currentAmmo === currentWeapon.clipSize || currentWeapon.reserveAmmo <= 0) {
      return;
    }
    this.player.isReloading = true;
    this.player.reloadingProgress = 0;
    soundManager.playReload();

    const startTime = Date.now();
    const duration = currentWeapon.reloadTime;

    const reloadInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      this.player.reloadingProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      this.notifyState();

      if (elapsed >= duration) {
        clearInterval(reloadInterval);
        if (this.player.isReloading) {
          const needed = currentWeapon.clipSize - currentWeapon.currentAmmo;
          const available = Math.min(needed, currentWeapon.reserveAmmo);
          currentWeapon.currentAmmo += available;
          currentWeapon.reserveAmmo -= available;
          this.player.isReloading = false;
          this.player.reloadingProgress = 0;
          this.notifyState();
        }
      }
    }, 50);
  }

  shoot() {
    const now = Date.now();
    const currentWeapon = this.player.weapons[this.player.currentWeaponKey];

    if (this.player.isReloading) return;
    if (now - this.player.lastShotTime < currentWeapon.fireRate) return;

    if (currentWeapon.currentAmmo <= 0) {
      this.reload();
      return;
    }

    currentWeapon.currentAmmo--;
    this.player.lastShotTime = now;
    soundManager.playShoot(currentWeapon.type);

    // Muzzle Recoil animation
    this.weaponGroup.position.z = -0.3;
    this.weaponGroup.rotation.x = 0.2;

    // Bullet Raycast / Projectile logic
    const pelletsCount = currentWeapon.type === 'shotgun' ? currentWeapon.pellets : 1;
    const dmgMultiplier = this.doubleDamageTimer > 0 ? 2 : 1;

    for (let i = 0; i < pelletsCount; i++) {
      const raycaster = new THREE.Raycaster();
      const spreadX = (Math.random() - 0.5) * currentWeapon.spread;
      const spreadY = (Math.random() - 0.5) * currentWeapon.spread;

      const direction = new THREE.Vector3(spreadX, spreadY, -1);
      direction.applyQuaternion(this.camera.quaternion);
      direction.normalize();

      raycaster.set(this.camera.position, direction);

      // Check hit against enemies
      const enemyMeshes = this.enemies.map(e => e.mesh);
      const intersects = raycaster.intersectObjects(enemyMeshes, true);

      if (intersects.length > 0) {
        const hitObj = intersects[0].object;
        let enemy = this.enemies.find(e => e.mesh === hitObj || e.mesh.children.includes(hitObj));
        if (enemy) {
          enemy.health -= currentWeapon.damage * dmgMultiplier;
          soundManager.playHit();
          this.createHitParticles(intersects[0].point);

          if (enemy.health <= 0) {
            this.killEnemy(enemy);
          }
        }
      }
    }

    this.notifyState();
  }

  createHitParticles(point) {
    for (let i = 0; i < 8; i++) {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array([0, 0, 0]);
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({ color: 0xef4444, size: 0.15 });
      const p = new THREE.Points(geo, mat);
      p.position.copy(point);
      p.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 4,
        (Math.random() - 0.5) * 4
      );
      p.life = 0.3;
      this.scene.add(p);
      this.particles.push(p);
    }
  }

  spawnEnemy() {
    const isBoss = this.wave % 5 === 0 && this.enemiesRemaining === 1;
    const enemyGroup = new THREE.Group();

    const radius = isBoss ? 1.2 : 0.6;
    const height = isBoss ? 3.0 : 1.8;

    const bodyGeo = new THREE.CylinderGeometry(radius, radius, height, 16);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: isBoss ? 0xd97706 : 0xd97706,
      emissive: isBoss ? 0x7c2d12 : 0x000000,
      roughness: 0.3,
      metalness: 0.7
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = height / 2;
    body.castShadow = true;
    enemyGroup.add(body);

    // Red Glowing Eyes
    const eyeGeo = new THREE.SphereGeometry(isBoss ? 0.25 : 0.12, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const eyeLeft = new THREE.Mesh(eyeGeo, eyeMat);
    eyeLeft.position.set(-radius * 0.4, height * 0.75, radius * 0.8);
    const eyeRight = new THREE.Mesh(eyeGeo, eyeMat);
    eyeRight.position.set(radius * 0.4, height * 0.75, radius * 0.8);
    enemyGroup.add(eyeLeft, eyeRight);

    // Random Arena Edge Spawn Position
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 8;
    enemyGroup.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);

    this.scene.add(enemyGroup);

    const enemyObj = {
      mesh: enemyGroup,
      health: isBoss ? 350 + this.wave * 100 : 60 + this.wave * 25,
      maxHealth: isBoss ? 350 + this.wave * 100 : 60 + this.wave * 25,
      speed: isBoss ? 3.2 : 4.5 + Math.min(this.wave * 0.2, 3),
      damage: isBoss ? 35 : 12 + Math.min(this.wave * 2, 20),
      isBoss,
      lastAttackTime: 0
    };

    this.enemies.push(enemyObj);
  }

  killEnemy(enemy) {
    this.scene.remove(enemy.mesh);
    this.enemies = this.enemies.filter(e => e !== enemy);
    this.kills++;
    this.score += enemy.isBoss ? 500 : 100;
    this.enemiesRemaining--;

    // Chance to drop powerup
    if (Math.random() < 0.35) {
      this.spawnPowerup(enemy.mesh.position);
    }

    if (this.enemiesRemaining <= 0 && this.enemies.length === 0) {
      this.startNextWave();
    }
    this.notifyState();
  }

  spawnPowerup(pos) {
    const types = ['health', 'ammo', 'damage'];
    const type = types[Math.floor(Math.random() * types.length)];
    const colors = { health: 0x22c55e, ammo: 0xeab308, damage: 0xa855f7 };

    const geo = new THREE.OctahedronGeometry(0.4);
    const mat = new THREE.MeshStandardMaterial({
      color: colors[type],
      emissive: colors[type],
      emissiveIntensity: 0.5,
      roughness: 0.2
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos.x, 0.6, pos.z);
    mesh.castShadow = true;
    this.scene.add(mesh);

    this.powerups.push({ mesh, type });
  }

  startNextWave() {
    this.wave++;
    this.enemiesRemaining = 5 + this.wave * 3;
    this.waveStatus = `Wave ${this.wave}`;
    soundManager.playWaveStart();

    // Spawn wave enemies sequentially
    let spawned = 0;
    const spawnInterval = setInterval(() => {
      if (spawned < this.enemiesRemaining) {
        this.spawnEnemy();
        spawned++;
      } else {
        clearInterval(spawnInterval);
      }
    }, 1200);

    this.notifyState();
  }

  start() {
    this.isRunning = true;
    this.isPaused = false;
    this.enemiesRemaining = 5;
    for (let i = 0; i < 5; i++) {
      this.spawnEnemy();
    }
    this.clock.start();
    this.animate();
    this.notifyState();
  }

  animate() {
    if (!this.isRunning) return;
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);

    if (!this.isPaused) {
      this.updatePlayer(delta);
      this.updateEnemies(delta);
      this.updateParticles(delta);
      this.updatePowerups(delta);
      this.updateWeaponRecoil(delta);

      if (this.doubleDamageTimer > 0) {
        this.doubleDamageTimer -= delta;
      }

      if (this.input.shoot) {
        this.shoot();
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  updatePlayer(delta) {
    // Rotation
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.x = this.pitch;
    euler.y = this.yaw;
    this.camera.quaternion.setFromEuler(euler);

    // Movement direction vectors
    const moveVector = new THREE.Vector3();
    if (this.input.moveForward) moveVector.z -= 1;
    if (this.input.moveBackward) moveVector.z += 1;
    if (this.input.moveLeft) moveVector.x -= 1;
    if (this.input.moveRight) moveVector.x += 1;

    // Add virtual joystick input
    if (this.input.virtualMove.x !== 0 || this.input.virtualMove.y !== 0) {
      moveVector.x += this.input.virtualMove.x;
      moveVector.z += this.input.virtualMove.y;
    }

    moveVector.normalize();

    const speed = 10;
    const sideVector = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    const forwardVector = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

    const velocityX = (sideVector.x * moveVector.x + forwardVector.x * -moveVector.z) * speed;
    const velocityZ = (sideVector.z * moveVector.x + forwardVector.z * -moveVector.z) * speed;

    this.player.position.x += velocityX * delta;
    this.player.position.z += velocityZ * delta;

    // Gravity & Jump
    this.player.velocity.y -= 20 * delta;
    this.player.position.y += this.player.velocity.y * delta;

    if (this.player.position.y <= 1.6) {
      this.player.position.y = 1.6;
      this.player.velocity.y = 0;
      this.player.isGrounded = true;
    }

    // Arena boundary limits (-38 to 38)
    this.player.position.x = Math.max(-38, Math.min(38, this.player.position.x));
    this.player.position.z = Math.max(-38, Math.min(38, this.player.position.z));

    this.camera.position.copy(this.player.position);
  }

  updateEnemies(delta) {
    const now = Date.now();

    this.enemies.forEach(enemy => {
      // Rotate towards player
      enemy.mesh.lookAt(this.player.position.x, enemy.mesh.position.y, this.player.position.z);

      // Move towards player
      const dir = new THREE.Vector3()
        .subVectors(this.player.position, enemy.mesh.position)
        .setY(0)
        .normalize();

      enemy.mesh.position.addScaledVector(dir, enemy.speed * delta);

      // Check distance to player for attack
      const dist = enemy.mesh.position.distanceTo(this.player.position);
      if (dist < 2.0 && now - enemy.lastAttackTime > 1000) {
        this.damagePlayer(enemy.damage);
        enemy.lastAttackTime = now;
      }
    });
  }

  damagePlayer(amount) {
    if (this.player.armor > 0) {
      const armorAbsorb = Math.min(this.player.armor, amount * 0.6);
      this.player.armor -= armorAbsorb;
      amount -= armorAbsorb;
    }

    this.player.health -= amount;
    soundManager.playDamage();

    if (this.player.health <= 0) {
      this.player.health = 0;
      this.gameOver();
    }
    this.notifyState();
  }

  updateParticles(delta) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;
      p.position.addScaledVector(p.velocity, delta);
      if (p.life <= 0) {
        this.scene.remove(p);
        this.particles.splice(i, 1);
      }
    }
  }

  updatePowerups(delta) {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const item = this.powerups[i];
      item.mesh.rotation.y += delta * 2;

      // Distance check to player
      const dist = item.mesh.position.distanceTo(this.player.position);
      if (dist < 2.0) {
        soundManager.playPowerup();
        if (item.type === 'health') {
          this.player.health = Math.min(this.player.maxHealth, this.player.health + 40);
        } else if (item.type === 'ammo') {
          Object.values(this.player.weapons).forEach(w => {
            w.reserveAmmo = Math.min(w.maxReserve, w.reserveAmmo + w.clipSize * 2);
          });
        } else if (item.type === 'damage') {
          this.doubleDamageTimer = 10; // 10s double damage boost
        }

        this.scene.remove(item.mesh);
        this.powerups.splice(i, 1);
        this.notifyState();
      }
    }
  }

  updateWeaponRecoil(delta) {
    if (this.weaponGroup) {
      this.weaponGroup.position.z = THREE.MathUtils.lerp(this.weaponGroup.position.z, -0.4, delta * 15);
      this.weaponGroup.rotation.x = THREE.MathUtils.lerp(this.weaponGroup.rotation.x, 0, delta * 15);
    }
  }

  gameOver() {
    this.isRunning = false;
    this.notifyState('GAME_OVER');
  }

  notifyState(event = null) {
    if (this.onStateUpdate) {
      this.onStateUpdate({
        event,
        score: this.score,
        kills: this.kills,
        wave: this.wave,
        waveStatus: this.waveStatus,
        enemiesRemaining: this.enemiesRemaining,
        doubleDamageTimer: Math.ceil(this.doubleDamageTimer),
        player: {
          health: this.player.health,
          maxHealth: this.player.maxHealth,
          armor: this.player.armor,
          maxArmor: this.player.maxArmor,
          currentWeaponKey: this.player.currentWeaponKey,
          currentWeapon: this.player.weapons[this.player.currentWeaponKey],
          weapons: this.player.weapons,
          isReloading: this.player.isReloading,
          reloadingProgress: this.player.reloadingProgress
        }
      });
    }
  }

  destroy() {
    this.isRunning = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('resize', this.handleResize);

    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}
