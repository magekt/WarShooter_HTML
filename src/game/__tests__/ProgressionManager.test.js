import { describe, it, expect, beforeEach, vi } from 'vitest';
import { progression } from '../ProgressionManager.js';

// Simple in-memory localStorage mock for node environment test
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    clear: () => { store = {}; },
    removeItem: (key) => { delete store[key]; }
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('ProgressionManager Sanitization', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should fall back to defaults when localStorage contains invalid types or empty data', () => {
    localStorage.setItem('WARZONE_PROGRESSION_SAVE_V1', 'invalid json string');
    const data = progression.loadData();
    expect(data.coins).toBe(150);
    expect(data.selectedStyle).toBe('wuxia');
    expect(data.stats.maxHealth).toBe(100);
  });

  it('should sanitize corrupted or untrusted numeric values', () => {
    const malicious = {
      coins: "1000000", // invalid type string
      selectedStyle: "hacked_style", // invalid style
      stats: {
        maxHealth: -500, // out of min range
        attackPower: NaN // NaN corruption
      }
    };
    localStorage.setItem('WARZONE_PROGRESSION_SAVE_V1', JSON.stringify(malicious));
    const data = progression.loadData();

    expect(data.coins).toBe(150); // reset to fallback
    expect(data.selectedStyle).toBe('wuxia'); // reset to allowed enum default
    expect(data.stats.maxHealth).toBe(100); // reset to fallback
    expect(data.stats.attackPower).toBe(1); // reset to fallback
  });

  it('should preserve valid save data values within safe bounds', () => {
    const validSave = {
      coins: 500,
      cultivationRealm: 'Novice Disciple (1/3 Stage)',
      realmLevel: 2,
      selectedStyle: 'modern',
      stats: {
        maxHealth: 140,
        maxEnergy: 100,
        attackPower: 1.2,
        moveSpeed: 1
      },
      upgrades: {
        healthLevel: 2,
        energyLevel: 0,
        attackLevel: 1,
        speedLevel: 0
      }
    };
    localStorage.setItem('WARZONE_PROGRESSION_SAVE_V1', JSON.stringify(validSave));
    const data = progression.loadData();

    expect(data.coins).toBe(500);
    expect(data.selectedStyle).toBe('modern');
    expect(data.stats.maxHealth).toBe(140);
  });
});
