export default function PauseScreen({ onResume, onQuit }) {
  return (
    <div id="pause-screen" className="screen-overlay">
      <h2>暂停中...</h2>
      <button className="btn" onClick={onResume}>继续营业</button>
      <button className="btn btn-small" style={{ background: '#8a6a4a' }} onClick={onQuit}>直接结算</button>
    </div>
  );
}
