import { MODES } from '../game/config';

export default function MainMenu({ onStart }) {
  return (
    <div id="main-screen" className="screen-overlay">
      <h1>🧋 奶茶店大作战</h1>
      <p className="menu-sub">选择玩法模式</p>
      <div className="mode-list">
        {MODES.map((m) => (
          <button
            key={m.key}
            className="mode-card"
            style={{ borderColor: m.color }}
            onClick={() => onStart(m.key)}
          >
            <span className="mode-icon">{m.icon}</span>
            <span className="mode-title">{m.title}</span>
            <span className="mode-desc">{m.desc}</span>
            <span className="mode-start" style={{ background: m.color }}>开始营业 ▶</span>
          </button>
        ))}
      </div>
      <p className="controls-hint">🖱 鼠标拖动 / 📱 手指滑动 / ⌨ A 和 D 键</p>
    </div>
  );
}
