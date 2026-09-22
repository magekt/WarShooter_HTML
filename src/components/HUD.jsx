import React from 'react';
import { Shield, Heart, Zap, RotateCcw, Crosshair } from 'lucide-react';

export default function HUD({ gameState, gameEngine }) {
  if (!gameState || !gameState.player) return null;

  const { player, score, kills, wave, waveStatus, doubleDamageTimer } = gameState;
  const currentWeapon = player.currentWeapon;

  return (
    <div className="hud-container pointer-events-none" style={{ position: 'absolute', inset: 0, zIndex: 30, padding: '16px' }}>

      {/* Top Bar - Health, Armor, Score, Wave */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>

        {/* Health and Armor Panel */}
        <div className="hud-panel animate__animated animate__fadeInLeft" style={{ padding: '12px 20px', minWidth: '220px' }}>
          {/* Health */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Heart size={20} color="#ef4444" fill="#ef4444" aria-hidden="true" />
            <div
              role="progressbar"
              aria-label="Health"
              aria-valuemin={0}
              aria-valuemax={player.maxHealth}
              aria-valuenow={Math.ceil(player.health)}
              style={{ flex: 1, height: '14px', background: '#334155', borderRadius: '7px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <div style={{
                height: '100%',
                width: `${(player.health / player.maxHealth) * 100}%`,
                background: 'linear-gradient(90deg, #ef4444 0%, #22c55e 100%)',
                transition: 'width 0.2s ease-out'
              }} />
            </div>
            <span className="game-font-hud" style={{ fontSize: '18px', fontWeight: 'bold', minWidth: '35px', textAlign: 'right' }}>
              {Math.ceil(player.health)}
            </span>
          </div>

          {/* Armor */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="#3b82f6" fill="#3b82f6" aria-hidden="true" />
            <div
              role="progressbar"
              aria-label="Armor"
              aria-valuemin={0}
              aria-valuemax={player.maxArmor}
              aria-valuenow={Math.ceil(player.armor)}
              style={{ flex: 1, height: '10px', background: '#334155', borderRadius: '5px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <div style={{
                height: '100%',
                width: `${(player.armor / player.maxArmor) * 100}%`,
                background: '#3b82f6',
                transition: 'width 0.2s ease-out'
              }} />
            </div>
            <span className="game-font-hud" style={{ fontSize: '16px', minWidth: '35px', textAlign: 'right', color: '#93c5fd' }}>
              {Math.ceil(player.armor)}
            </span>
          </div>
        </div>

        {/* Center Wave Info */}
        <div className="hud-panel animate__animated animate__fadeInDown" style={{ padding: '8px 24px', textAlign: 'center' }}>
          <div className="game-font-title" style={{ fontSize: '14px', color: '#94a3b8', letterSpacing: '2px' }}>TACTICAL ZONE</div>
          <div className="game-font-hud" style={{ fontSize: '28px', color: '#f59e0b', margin: '-4px 0' }}>{waveStatus}</div>
          <div style={{ fontSize: '12px', color: '#cbd5e1' }}>KILLS: {kills}</div>
        </div>

        {/* Score and Double Damage Indicator */}
        <div className="hud-panel animate__animated animate__fadeInRight" style={{ padding: '12px 20px', textAlign: 'right', minWidth: '160px' }}>
          <div className="game-font-title" style={{ fontSize: '12px', color: '#94a3b8' }}>SCORE</div>
          <div className="game-font-hud" style={{ fontSize: '32px', color: '#38bdf8', lineHeight: 1 }}>{score}</div>
          {doubleDamageTimer > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', color: '#a855f7', marginTop: '4px', fontWeight: 'bold' }}>
              <Zap size={16} fill="#a855f7" /> 2X DMG ({doubleDamageTimer}s)
            </div>
          )}
        </div>
      </div>

      {/* Crosshair in Center */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.8 }}>
        <Crosshair size={28} color="#ffffff" />
      </div>

      {/* Bottom Bar - Weapons, Ammo & Weapon Switchers */}
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>

        {/* Weapon Selector Buttons */}
        <div style={{ display: 'flex', gap: '8px' }} className="pointer-events-auto" role="group" aria-label="Weapon selection">
          {Object.entries(player.weapons).map(([key, w]) => (
            <button
              key={key}
              aria-label={`Select ${w.name}`}
              onClick={() => gameEngine && gameEngine.switchWeapon(key)}
              className={`hud-btn ${player.currentWeaponKey === key ? 'active' : ''}`}
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                borderRadius: '6px',
                borderColor: player.currentWeaponKey === key ? w.color : 'rgba(255,255,255,0.2)'
              }}
            >
              {w.name.split(' ')[1] || w.name}
            </button>
          ))}
        </div>

        {/* Ammo Display */}
        <div className="hud-panel animate__animated animate__fadeInUp" style={{ padding: '12px 24px', textAlign: 'right', minWidth: '180px' }}>
          <div style={{ fontSize: '12px', color: currentWeapon.color, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {currentWeapon.name}
          </div>

          {player.isReloading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', color: '#f59e0b', margin: '4px 0' }}>
              <RotateCcw size={18} className="animate__animated animate__spin animate__infinite" />
              <span className="game-font-hud" style={{ fontSize: '24px' }}>RELOADING {player.reloadingProgress}%</span>
            </div>
          ) : (
            <div className="game-font-hud" style={{ fontSize: '38px', lineHeight: 1, color: '#ffffff' }}>
              {currentWeapon.currentAmmo} <span style={{ fontSize: '20px', color: '#64748b' }}>/ {currentWeapon.reserveAmmo}</span>
            </div>
          )}
        </div>
      </div>

      {/* Low Health Vignette Warning */}
      {player.health < 30 && <div id="low-health-vignette" />}
    </div>
  );
}
