import React from 'react';
import { Play, RotateCcw, Volume2, Smartphone, ShieldCheck } from 'lucide-react';

export default function Menu({ gameState, onStartGame, onRestartGame }) {
  const isGameOver = gameState?.event === 'GAME_OVER';

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 100,
      background: 'rgba(10, 14, 23, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="hud-panel animate__animated animate__zoomIn" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '36px',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
      }}>

        {isGameOver ? (
          <>
            <h1 className="game-font-title animate__animated animate__shakeX" style={{ fontSize: '42px', color: '#ef4444', margin: '0 0 10px 0' }}>
              MISSION FAILED
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
              YOU SURVIVED UNTIL WAVE <strong style={{ color: '#f59e0b' }}>{gameState.wave}</strong>
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              background: 'rgba(0,0,0,0.3)',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '28px'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>TOTAL SCORE</div>
                <div className="game-font-hud" style={{ fontSize: '32px', color: '#38bdf8' }}>{gameState.score}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>HOSTILES ELIMINATED</div>
                <div className="game-font-hud" style={{ fontSize: '32px', color: '#ef4444' }}>{gameState.kills}</div>
              </div>
            </div>

            <button onClick={onRestartGame} className="hud-btn" style={{
              width: '100%',
              padding: '14px',
              fontSize: '18px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
            }}>
              <RotateCcw size={22} /> DEPLOY AGAIN
            </button>
          </>
        ) : (
          <>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59, 130, 246, 0.2)', padding: '6px 14px', borderRadius: '20px', color: '#60a5fa', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
              <ShieldCheck size={16} /> TACTICAL COMBAT SIMULATOR
            </div>

            <h1 className="game-font-title animate__animated animate__fadeInDown" style={{ fontSize: '36px', letterSpacing: '2px', color: '#ffffff', margin: '0 0 10px 0' }}>
              WAR ZONE 3D
            </h1>

            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
              Eliminate incoming hostiles, unlock weapons, collect power-ups, and survive endless tactical enemy waves.
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              background: 'rgba(0,0,0,0.2)',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '28px',
              fontSize: '12px',
              color: '#cbd5e1'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Volume2 size={16} color="#38bdf8" /> Procedural Audio
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Smartphone size={16} color="#22c55e" /> Touch & Desktop
              </div>
            </div>

            <button onClick={onStartGame} className="hud-btn" style={{
              width: '100%',
              padding: '16px',
              fontSize: '20px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
            }}>
              <Play size={24} fill="#ffffff" /> START OPERATION
            </button>
          </>
        )}

      </div>
    </div>
  );
}
