import { CONFIG } from '../game/config';

export default function HUD({ modeKey, hud, onPause }) {
  return (
    <div id="ui-layer">
      <div id="hud-left">
        <div className="hud-line">
          分数: <span className="hud-value">{hud.score}</span>
        </div>
        {modeKey === 'catch' && (
          <div className={`hud-line ${hud.comboActive ? 'combo-active' : ''}`}>
            连击: <span className="hud-value">{hud.combo}</span>
            {hud.comboActive && (
              <span className="combo-badge">×{CONFIG.catch.comboMultiplier} 翻倍</span>
            )}
          </div>
        )}
      </div>
      <div id="hud-right">
        <div className="hud-line">
          时间: <span className="hud-value">{Math.ceil(hud.timeLeft)}</span>s
        </div>
        <button id="pause-btn" onClick={onPause}>⏸</button>
      </div>
    </div>
  );
}
