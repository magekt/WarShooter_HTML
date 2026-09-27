import { describe, it, expect } from 'vitest';
import { WEAPONS } from './WeaponManager';

describe('WeaponManager', () => {
  it('defines valid weapons with expected properties', () => {
    expect(WEAPONS.pistol).toBeDefined();
    expect(WEAPONS.rifle).toBeDefined();
    expect(WEAPONS.shotgun).toBeDefined();
    expect(WEAPONS.pistol.damage).toBeGreaterThan(0);
    expect(WEAPONS.rifle.damage).toBeGreaterThan(0);
    expect(WEAPONS.shotgun.pellets).toBe(8);
  });
});
