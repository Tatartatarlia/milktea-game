import { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/engine';
import { CONFIG, MODES } from '../game/config';
import HUD from './HUD';
import PauseScreen from './PauseScreen';
import EndScreen from './EndScreen';

export default function GameScreen({ modeKey, onHome }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [hud, setHud] = useState({ score: 0, timeLeft: CONFIG.gameDuration, combo: 0, comboActive: false });
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState(null);

  // 创建并启动引擎（组件挂载 / 切换模式时）
  useEffect(() => {
    const engine = new GameEngine(canvasRef.current, modeKey, {
      onHud: (h) => setHud(h),
      onEnd: (r) => setResult(r),
    });
    engineRef.current = engine;
    engine.start();
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [modeKey]);

  const handlePause = () => {
    const e = engineRef.current;
    if (e && e.state === 'playing') {
      e.pause();
      setPaused(true);
    }
  };

  const handleResume = () => {
    const e = engineRef.current;
    if (e && e.state === 'paused') {
      e.resume();
      setPaused(false);
    }
  };

  const handleQuit = () => {
    const e = engineRef.current;
    if (e && (e.state === 'playing' || e.state === 'paused')) {
      e.quit();
      setPaused(false);
    }
  };

  const handleRestart = () => {
    const e = engineRef.current;
    setResult(null);
    setPaused(false);
    e.start();
  };

  const mode = MODES.find((m) => m.key === modeKey);

  return (
    <div className="game-root">
      <canvas ref={canvasRef} id="gameCanvas"></canvas>
      <HUD modeKey={modeKey} hud={hud} onPause={handlePause} />
      {paused && <PauseScreen onResume={handleResume} onQuit={handleQuit} />}
      {result && <EndScreen result={result} mode={mode} onRestart={handleRestart} onHome={onHome} />}
    </div>
  );
}
