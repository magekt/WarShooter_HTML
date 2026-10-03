import { describe, it, expect, beforeEach } from 'vitest';
import { sanitizeSaveData, ProgressionManager } from './ProgressionManager';

describe('ProgressionManager Security & Sanitization', () => {
  let mockStore = {};

  beforeEach(() => {
    mockStore = {};
    const localStorageMock = {
      getItem: (key) => mockStore[key] || null,
      setItem: (key, value) => { mockStore[key] = String(value); },
      removeItem: (key) => { delete mockStore[key]; },
      clear: () => { mockStore = {}; }
    };
    globalThis.localStorage = localStorageMock;
  });

  it('sanitizes invalid or untrusted objects from localStorage', () => {
    const maliciousInput = {
      coins: -500,
      selectedStyle: '__proto__',
      stats: { maxHealth: '10000000', attackPower: NaN },
      upgrades: { healthLevel: -50 }
    };

    const sanitized = sanitizeSaveData(maliciousInput);

    expect(sanitized.coins).toBe(0); // clamped to min 0
    expect(sanitized.selectedStyle).toBe('wuxia'); // falls back to default style
    expect(sanitized.stats.maxHealth).toBe(100); // string fall back to default
    expect(sanitized.stats.attackPower).toBe(1); // NaN falls back to default
    expect(sanitized.upgrades.healthLevel).toBe(0); // negative clamped to 0
  });

  it('handles null, primitive, or array input without crashing', () => {
    expect(sanitizeSaveData(null).selectedStyle).toBe('wuxia');
    expect(sanitizeSaveData('malicious string').coins).toBe(150);
    expect(sanitizeSaveData([1, 2, 3]).realmLevel).toBe(1);
  });

  it('safely handles progression manager addCoins with invalid amounts', () => {
    const manager = new ProgressionManager();
    const initialCoins = manager.data.coins;

    manager.addCoins(-100);
    expect(manager.data.coins).toBe(initialCoins);

    manager.addCoins(NaN);
    expect(manager.data.coins).toBe(initialCoins);

    manager.addCoins('10000');
    expect(manager.data.coins).toBe(initialCoins);

    manager.addCoins(50);
    expect(manager.data.coins).toBe(initialCoins + 50);
  });
});
