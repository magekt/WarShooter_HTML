export const WEAPONS = {
  pistol: {
    name: 'Tactical Pistol',
    type: 'pistol',
    damage: 25,
    fireRate: 250, // ms between shots
    clipSize: 12,
    currentAmmo: 12,
    reserveAmmo: 96,
    maxReserve: 120,
    reloadTime: 1200,
    range: 60,
    spread: 0.02,
    color: '#38bdf8'
  },
  rifle: {
    name: 'Assault Rifle',
    type: 'rifle',
    damage: 35,
    fireRate: 110,
    clipSize: 30,
    currentAmmo: 30,
    reserveAmmo: 180,
    maxReserve: 240,
    reloadTime: 1800,
    range: 100,
    spread: 0.04,
    color: '#eab308'
  },
  shotgun: {
    name: 'Pump Shotgun',
    type: 'shotgun',
    damage: 18, // Per pellet (8 pellets = 144 max point blank)
    pellets: 8,
    fireRate: 800,
    clipSize: 8,
    currentAmmo: 8,
    reserveAmmo: 40,
    maxReserve: 64,
    reloadTime: 2200,
    range: 40,
    spread: 0.12,
    color: '#ef4444'
  }
};
