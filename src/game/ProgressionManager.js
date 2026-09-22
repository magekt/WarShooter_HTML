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

class ProgressionManager {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Error loading save data, initializing default", e);
    }

    return {
      coins: 150,
      cultivationRealm: 'Novice Disciple Stage 1',
      realmLevel: 1,
      selectedStyle: 'wuxia',
      stats: {
        maxHealth: 100,
        maxEnergy: 100,
        attackPower: 1,
        moveSpeed: 1
      },
      upgrades: {
        healthLevel: 0,
        energyLevel: 0,
        attackLevel: 0,
        speedLevel: 0
      }
    };
  }

  saveData() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error("Failed to save progression", e);
    }
  }

  addCoins(amount) {
    this.data.coins += amount;
    this.checkRealmBreakthrough();
    this.saveData();
  }

  setStyle(styleId) {
    if (FIGHTING_STYLES[styleId]) {
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
