import React, { useRef, useEffect } from 'react';
import { Target, RotateCcw, ArrowUp } from 'lucide-react';

export default function TouchControls({ gameEngine }) {
  const joystickRef = useRef(null);
  const touchLookRef = useRef(null);
  const joystickTouchId = useRef(null);
  const joystickCenter = useRef({ x: 0, y: 0 });
  const lastLookTouch = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const joystick = joystickRef.current;
    if (!joystick) return;

    const handleJoystickStart = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (joystickTouchId.current === null) {
          joystickTouchId.current = touch.identifier;
          const rect = joystick.getBoundingClientRect();
          joystickCenter.current = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          };
          updateJoystick(touch);
        }
      }
    };

    const handleJoystickMove = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === joystickTouchId.current) {
          updateJoystick(touch);
        }
      }
    };

    const handleJoystickEnd = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joystickTouchId.current) {
          joystickTouchId.current = null;
          if (gameEngine) gameEngine.setVirtualJoystick(0, 0);
          const stick = joystick.querySelector('.touch-joystick-stick');
          if (stick) {
            stick.style.transform = 'translate(0px, 0px)';
          }
        }
      }
    };

    const updateJoystick = (touch) => {
      const deltaX = touch.clientX - joystickCenter.current.x;
      const deltaY = touch.clientY - joystickCenter.current.y;
      const maxRadius = 45;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const angle = Math.atan2(deltaY, deltaX);

      const clampDist = Math.min(dist, maxRadius);
      const moveX = Math.cos(angle) * clampDist;
      const moveY = Math.sin(angle) * clampDist;

      const stick = joystick.querySelector('.touch-joystick-stick');
      if (stick) {
        stick.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }

      if (gameEngine) {
        // Normalize -1 to 1
        gameEngine.setVirtualJoystick(moveX / maxRadius, moveY / maxRadius);
      }
    };

    joystick.addEventListener('touchstart', handleJoystickStart, { passive: false });
    window.addEventListener('touchmove', handleJoystickMove, { passive: false });
    window.addEventListener('touchend', handleJoystickEnd, { passive: false });

    return () => {
      joystick.removeEventListener('touchstart', handleJoystickStart);
      window.removeEventListener('touchmove', handleJoystickMove);
      window.removeEventListener('touchend', handleJoystickEnd);
    };
  }, [gameEngine]);

  // Handle Touch Look Camera Area
  useEffect(() => {
    const lookArea = touchLookRef.current;
    if (!lookArea) return;

    let lookTouchId = null;

    const handleLookStart = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (lookTouchId === null && touch.clientX > window.innerWidth / 3) {
          lookTouchId = touch.identifier;
          lastLookTouch.current = { x: touch.clientX, y: touch.clientY };
        }
      }
    };

    const handleLookMove = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === lookTouchId) {
          const deltaX = touch.clientX - lastLookTouch.current.x;
          const deltaY = touch.clientY - lastLookTouch.current.y;
          lastLookTouch.current = { x: touch.clientX, y: touch.clientY };

          if (gameEngine) {
            gameEngine.handleTouchLook(deltaX, deltaY);
          }
        }
      }
    };

    const handleLookEnd = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === lookTouchId) {
          lookTouchId = null;
        }
      }
    };

    lookArea.addEventListener('touchstart', handleLookStart, { passive: false });
    window.addEventListener('touchmove', handleLookMove, { passive: false });
    window.addEventListener('touchend', handleLookEnd, { passive: false });

    return () => {
      lookArea.removeEventListener('touchstart', handleLookStart);
      window.removeEventListener('touchmove', handleLookMove);
      window.removeEventListener('touchend', handleLookEnd);
    };
  }, [gameEngine]);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40 }}>
      {/* Touch Look Area */}
      <div
        ref={touchLookRef}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '65%',
          height: '100%',
          pointerEvents: 'auto'
        }}
      />

      {/* Virtual Movement Joystick */}
      <div ref={joystickRef} className="touch-joystick-container pointer-events-auto">
        <div className="touch-joystick-stick" />
      </div>

      {/* Touch Action Buttons (Shoot, Reload, Jump) */}
      <div style={{ position: 'absolute', bottom: '100px', right: '35px', display: 'flex', flexDirection: 'column', gap: '15px' }} className="pointer-events-auto">
        
        {/* Fire Button */}
        <button
          onTouchStart={() => gameEngine && (gameEngine.input.shoot = true)}
          onTouchEnd={() => gameEngine && (gameEngine.input.shoot = false)}
          onMouseDown={() => gameEngine && (gameEngine.input.shoot = true)}
          onMouseUp={() => gameEngine && (gameEngine.input.shoot = false)}
          className="touch-action-btn hud-btn"
          aria-label="Fire Weapon"
          style={{ width: '70px', height: '70px', backgroundColor: 'rgba(239, 68, 68, 0.8)', borderColor: '#fca5a5' }}
        >
          <Target size={36} aria-hidden="true" />
        </button>

        <div style={{ display: 'flex', gap: '15px' }}>
          {/* Jump Button */}
          <button
            onTouchStart={() => {
              if (gameEngine && gameEngine.player.isGrounded) {
                gameEngine.player.velocity.y = 7.5;
                gameEngine.player.isGrounded = false;
              }
            }}
            className="touch-action-btn hud-btn"
            aria-label="Jump"
            style={{ width: '55px', height: '55px', backgroundColor: 'rgba(59, 130, 246, 0.8)', borderColor: '#93c5fd' }}
          >
            <ArrowUp size={24} aria-hidden="true" />
          </button>

          {/* Reload Button */}
          <button
            onTouchStart={() => gameEngine && gameEngine.reload()}
            className="touch-action-btn hud-btn"
            aria-label="Reload Weapon"
            style={{ width: '55px', height: '55px', backgroundColor: 'rgba(234, 179, 8, 0.8)', borderColor: '#fde047' }}
          >
            <RotateCcw size={24} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
