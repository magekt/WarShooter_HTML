import { describe, it, expect, beforeEach } from 'vitest';
import { progression } from './ProgressionManager.js';

const SAVE_KEY = 'WARZONE_PROGRESSION_SAVE_V1';

// Mock localStorage for Vitest Node environment
const store = {};
const mockLocalStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => { store[key] = String(value); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

globalThis.localStorage = mockLocalStorage;

describe('ProgressionManager save data validation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads default data when localStorage is empty', () => {
    const data = progression.loadData();
    expect(data.coins).toBe(150);
    expect(data.selectedStyle).toBe('wuxia');
    expect(data.stats.maxHealth).toBe(100);
  });

  it('loads valid data correctly from localStorage', () => {
    const validData = {
      coins: 500,
      cultivationRealm: 'Novice Disciple',
      realmLevel: 2,
      selectedStyle: 'modern',
      stats: { maxHealth: 140, maxEnergy: 120, attackPower: 1.2, moveSpeed: 1.1 },
      upgrades: { healthLevel: 2, energyLevel: 1, attackLevel: 1, speedLevel: 1 }
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(validData));

    const loaded = progression.loadData();
    expect(loaded.coins).toBe(500);
    expect(loaded.selectedStyle).toBe('modern');
    expect(loaded.stats.maxHealth).toBe(140);
  });

  it('falls back to default values when loaded data contains corrupted or invalid types', () => {
    const maliciousData = {
      coins: -9999, // negative value
      selectedStyle: 'invalid_hacked_style', // unallowed enum value
      realmLevel: "invalid_number",
      stats: { maxHealth: null, maxEnergy: NaN, attackPower: -5, moveSpeed: "fast" },
      upgrades: "not_an_object"
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(maliciousData));

    const loaded = progression.loadData();
    expect(loaded.coins).toBe(150); // Fallback default
    expect(loaded.selectedStyle).toBe('wuxia'); // Fallback default
    expect(loaded.realmLevel).toBe(1); // Fallback default
    expect(loaded.stats.maxHealth).toBe(100); // Fallback default
    expect(loaded.stats.attackPower).toBe(1); // Fallback default
    expect(loaded.upgrades.healthLevel).toBe(0); // Fallback default
  });
});
