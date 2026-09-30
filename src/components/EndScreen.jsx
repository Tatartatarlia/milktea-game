export default function EndScreen({ result, mode, onRestart, onHome }) {
  return (
    <div id="end-screen" className="screen-overlay">
      <h2>营业结束</h2>
      <p className="end-mode">{result.modeTitle}</p>
      <p className="final-score-line">最终得分：<span id="finalScore">{result.score}</span></p>
      <p className="rating">{result.rating}</p>
      <div className="sub-stats">
        {result.stats.map((s) => (
          <span key={s.label} className="stat-item">
            {s.label}：{s.value}
          </span>
        ))}
      </div>
      <button className="btn" onClick={onRestart}>再来一局</button>
      <button className="btn btn-small" style={{ background: '#8a6a4a' }} onClick={onHome}>回到主界面</button>
    </div>
  );
}
