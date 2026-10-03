const SAVE_KEY = 'WARZONE_PROGRESSION_SAVE_V1';

export const FIGHTING_STYLES = {
  modern: {
    id: 'modern',
    name: 'Tactical Shooter',
    subtitle: 'Modern Firepower & High Caliber Weapons',
    color: '#38bdf8',
    icon: 'gun',
    resourceName: 'AMMO',
    primaryAttackName: 'Primary Weapon Fire',
    specialSkill1: 'Quick Reload / Grenade',
    specialSkill2: 'Tactical Combat Roll'
  },
  wuxia: {
    id: 'wuxia',
    name: 'Wuxia Murim Cultivation',
    subtitle: 'Qi Sword Ki, Sword Flying & Martial Arts',
    color: '#34d399',
    icon: 'sword',
    resourceName: 'QI ENERGY',
    primaryAttackName: 'Qi Sword Slash / Sword Ki',
    specialSkill1: 'Qinggong Lightfoot Dash',
    specialSkill2: 'Qi Sword Wave Array'
  },
  chakra: {
    id: 'chakra',
    name: 'Indian Mythic & Chakra',
    subtitle: 'Astra Elemental Weapons & Third Eye Energy',
    color: '#a855f7',
    icon: 'zap',
    resourceName: 'CHAKRA',
    primaryAttackName: 'Agneystra Fire Arrow',
    specialSkill1: 'Vajra Lightning Burst',
    specialSkill2: 'Third Eye Chakra Beam'
  }
};

const DEFAULT_PROGRESSION = {
  coins: 150,
  cultivationRealm: 'Novice Disciple Stage 1',
  realmLevel: 1,
  selectedStyle: 'wuxia',
  stats: { maxHealth: 100, maxEnergy: 100, attackPower: 1, moveSpeed: 1 },
  upgrades: { healthLevel: 0, energyLevel: 0, attackLevel: 0, speedLevel: 0 }
};

function sanitizeNum(n, fallback, min = 0, max = 1e9) {
  return typeof n === 'number' && Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
}

// Security: Validate and sanitize untrusted localStorage input to prevent state corruption or injection
export function sanitizeSaveData(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return JSON.parse(JSON.stringify(DEFAULT_PROGRESSION));

  const stats = raw.stats && typeof raw.stats === 'object' ? raw.stats : {};
  const upgrades = raw.upgrades && typeof raw.upgrades === 'object' ? raw.upgrades : {};

  const styleValid = Object.prototype.hasOwnProperty.call(FIGHTING_STYLES, raw.selectedStyle);

  return {
    coins: sanitizeNum(raw.coins, DEFAULT_PROGRESSION.coins, 0, 1e9),
    cultivationRealm: typeof raw.cultivationRealm === 'string' ? raw.cultivationRealm.slice(0, 100) : DEFAULT_PROGRESSION.cultivationRealm,
    realmLevel: sanitizeNum(raw.realmLevel, DEFAULT_PROGRESSION.realmLevel, 1, 100),
    selectedStyle: styleValid ? raw.selectedStyle : DEFAULT_PROGRESSION.selectedStyle,
    stats: {
      maxHealth: sanitizeNum(stats.maxHealth, DEFAULT_PROGRESSION.stats.maxHealth, 1, 1e5),
      maxEnergy: sanitizeNum(stats.maxEnergy, DEFAULT_PROGRESSION.stats.maxEnergy, 1, 1e5),
      attackPower: sanitizeNum(stats.attackPower, DEFAULT_PROGRESSION.stats.attackPower, 0.1, 1e4),
      moveSpeed: sanitizeNum(stats.moveSpeed, DEFAULT_PROGRESSION.stats.moveSpeed, 0.1, 100)
    },
    upgrades: {
      healthLevel: sanitizeNum(upgrades.healthLevel, DEFAULT_PROGRESSION.upgrades.healthLevel, 0, 1e4),
      energyLevel: sanitizeNum(upgrades.energyLevel, DEFAULT_PROGRESSION.upgrades.energyLevel, 0, 1e4),
      attackLevel: sanitizeNum(upgrades.attackLevel, DEFAULT_PROGRESSION.upgrades.attackLevel, 0, 1e4),
      speedLevel: sanitizeNum(upgrades.speedLevel, DEFAULT_PROGRESSION.upgrades.speedLevel, 0, 1e4)
    }
  };
}

export class ProgressionManager {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(SAVE_KEY);
        if (saved) {
          return sanitizeSaveData(JSON.parse(saved));
        }
      }
    } catch (e) {
      console.warn("Error loading save data, initializing default", e);
    }

    return JSON.parse(JSON.stringify(DEFAULT_PROGRESSION));
  }

  saveData() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
      }
    } catch (e) {
      console.error("Failed to save progression", e);
    }
  }

  addCoins(amount) {
    if (typeof amount === 'number' && Number.isFinite(amount) && amount > 0) {
      this.data.coins += amount;
      this.checkRealmBreakthrough();
      this.saveData();
    }
  }

  setStyle(styleId) {
    if (Object.prototype.hasOwnProperty.call(FIGHTING_STYLES, styleId)) {
      this.data.selectedStyle = styleId;
      this.saveData();
    }
  }

  getUpgradeCost(statKey) {
    const level = this.data.upgrades[statKey + 'Level'] || 0;
    return 100 + level * 75;
  }

  upgradeStat(statKey) {
    const cost = this.getUpgradeCost(statKey);
    if (this.data.coins >= cost) {
      this.data.coins -= cost;
      this.data.upgrades[statKey + 'Level'] = (this.data.upgrades[statKey + 'Level'] || 0) + 1;

      if (statKey === 'health') this.data.stats.maxHealth += 20;
      if (statKey === 'energy') this.data.stats.maxEnergy += 20;
      if (statKey === 'attack') this.data.stats.attackPower += 0.2;
      if (statKey === 'speed') this.data.stats.moveSpeed += 0.1;

      this.checkRealmBreakthrough();
      this.saveData();
      return true;
    }
    return false;
  }

  checkRealmBreakthrough() {
    const totalLevels = 
      (this.data.upgrades.healthLevel || 0) +
      (this.data.upgrades.energyLevel || 0) +
      (this.data.upgrades.attackLevel || 0) +
      (this.data.upgrades.speedLevel || 0);

    const realms = [
      'Mortal Practitioner',
      'Novice Disciple',
      'Qi Foundation Stage',
      'Chakra Awakening Realm',
      'Martial Grandmaster',
      'Mythic Astra Sovereign',
      'Heavenly Ascendant Peak'
    ];

    const realmIdx = Math.min(Math.floor(totalLevels / 3), realms.length - 1);
    this.data.realmLevel = realmIdx + 1;
    this.data.cultivationRealm = `${realms[realmIdx]} (${totalLevels % 3}/3 Stage)`;
  }
}

export const progression = new ProgressionManager();
