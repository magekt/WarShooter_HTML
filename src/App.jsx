import React, { useState, useEffect, useRef } from 'react';
import { GameEngine } from './game/GameEngine';
import HUD from './components/HUD';
import TouchControls from './components/TouchControls';
import Menu from './components/Menu';

export default function App() {
  const containerRef = useRef(null);
  const gameEngineRef = useRef(null);

  const [gameState, setGameState] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new GameEngine(containerRef.current, (updatedState) => {
      setGameState({ ...updatedState });
    });

    gameEngineRef.current = engine;

    return () => {
      engine.destroy();
    };
  }, []);

  const handleStartGame = () => {
    setIsPlaying(true);
    if (gameEngineRef.current) {
      gameEngineRef.current.start();
    }
  };

  const handleRestartGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.destroy();
    }
    setGameState(null);
    if (containerRef.current) {
      const engine = new GameEngine(containerRef.current, (updatedState) => {
        setGameState({ ...updatedState });
      });
      gameEngineRef.current = engine;
      engine.start();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Main Start / Game Over Overlay Menu */}
      {(!isPlaying || gameState?.event === 'GAME_OVER') && (
        <Menu
          gameState={gameState}
          onStartGame={handleStartGame}
          onRestartGame={handleRestartGame}
        />
      )}

      {/* In-Game Heads-Up Display */}
      {isPlaying && gameState?.event !== 'GAME_OVER' && (
        <>
          <HUD gameState={gameState} gameEngine={gameEngineRef.current} />
          <TouchControls gameEngine={gameEngineRef.current} />
        </>
      )}
    </div>
  );
}
