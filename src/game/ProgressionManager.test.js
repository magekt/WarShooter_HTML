import { describe, it, expect, beforeEach } from 'vitest';
import { ProgressionManager, FIGHTING_STYLES } from './ProgressionManager';

// Mock localStorage for Node testing environment
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('ProgressionManager Security & Validation', () => {
  let progression;

  beforeEach(() => {
    localStorage.clear();
    progression = new ProgressionManager();
  });

  it('should fall back to default when localStorage contains corrupted JSON', () => {
    localStorage.setItem('WARZONE_PROGRESSION_SAVE_V1', 'invalid{json:');
    const data = progression.loadData();
    expect(data.coins).toBe(150);
    expect(data.selectedStyle).toBe('wuxia');
  });

  it('should sanitize negative or NaN values in saved data', () => {
    const maliciousSave = {
      coins: -999,
      realmLevel: NaN,
      selectedStyle: 'invalid_style_key',
      stats: {
        maxHealth: -50,
        moveSpeed: 'invalid_speed'
      },
      upgrades: {
        attackLevel: -10
      }
    };
    localStorage.setItem('WARZONE_PROGRESSION_SAVE_V1', JSON.stringify(maliciousSave));

    const data = progression.loadData();
    expect(data.coins).toBe(150); // Default restored
    expect(data.selectedStyle).toBe('wuxia'); // Default style restored
    expect(data.stats.maxHealth).toBe(100);
    expect(data.stats.moveSpeed).toBe(1);
    expect(data.upgrades.attackLevel).toBe(0);
  });

  it('should reject invalid stat upgrade keys (prototype pollution protection)', () => {
    progression.data = progression.loadData();
    const initialHealth = progression.data.stats.maxHealth;

    const result = progression.upgradeStat('__proto__');
    expect(result).toBe(false);
    expect(progression.data.stats.maxHealth).toBe(initialHealth);
  });

  it('should sanitize style setting safely', () => {
    progression.data = progression.loadData();
    progression.setStyle('toString');
    expect(progression.data.selectedStyle).not.toBe('toString');
    expect(progression.data.selectedStyle).toBe('wuxia');

    progression.setStyle('modern');
    expect(progression.data.selectedStyle).toBe('modern');
  });
});
