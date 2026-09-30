// ================= 纯接取模式 =================
// 规则：接到任意小料 +10 分；连续接住 5 个进入连击状态，分数翻倍；
//      接错（漏接）一次连击归零；连击越高，小料下落越快。
import { CONFIG, TOPPINGS } from '../config.js';
import * as audio from '../audio.js';

export function createCatchMode(engine) {
  let combo = 0;
  let maxCombo = 0;
  let stats = { caught: 0, missed: 0 };

  return {
    key: 'catch',

    reset() {
      combo = 0;
      maxCombo = 0;
      stats = { caught: 0, missed: 0 };
    },

    update() {
      // 纯接取模式无订单等额外逻辑
    },

    // 连击横幅（画在顶部中央）
    renderCards(ctx) {
      if (combo <= 0) return;
      const comboActive = combo >= CONFIG.catch.comboThreshold;
      const text = comboActive
        ? `🔥 连击 ${combo} ×${CONFIG.catch.comboMultiplier}`
        : `连击 ${combo}`;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      let fontSize = 22;
      if (comboActive) {
        // 连击状态轻微脉动
        fontSize = 22 + Math.sin(performance.now() / 120) * 2;
      }
      ctx.font = `bold ${fontSize}px sans-serif`;

      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 5;
      ctx.strokeText(text, engine.width / 2, 14);
      ctx.fillStyle = comboActive ? '#d35400' : '#6b4226';
      ctx.fillText(text, engine.width / 2, 14);
      ctx.restore();
    },

    // 小料下落速度：随时间加快 + 每 1 点连击额外加速
    getCurrentToppingSpeed() {
      return (
        CONFIG.topping.baseSpeed +
        engine.elapsed * CONFIG.topping.speedPerSec +
        combo * CONFIG.catch.speedPerCombo
      );
    },

    handleCatch(topping) {
      const comboActive = combo >= CONFIG.catch.comboThreshold;
      const points = comboActive
        ? CONFIG.catch.catchScore * CONFIG.catch.comboMultiplier
        : CONFIG.catch.catchScore;

      engine.score += points;
      combo++;
      if (combo > maxCombo) maxCombo = combo;
      stats.caught++;

      const entered = combo === CONFIG.catch.comboThreshold;
      const tpl = TOPPINGS.find((t) => t.id === topping.type);
      engine.spawnParticles(topping.x, engine.cup.y, tpl.color, comboActive ? 18 : 10);
      engine.spawnFloatText(
        topping.x,
        engine.cup.y - 20,
        '+' + points + (comboActive ? ' ×2' : ''),
        comboActive ? '#d35400' : '#27ae60'
      );

      if (entered) {
        engine.spawnFloatText(engine.width / 2, engine.height * 0.35, '连击状态! 分数翻倍!', '#d35400');
        audio.soundComboUp();
      } else {
        audio.soundCorrect();
      }
    },

    // 漏接（小料掉出屏幕底部）→ 连击归零 + 扣分
    handleMiss(topping) {
      stats.missed++;
      if (combo > 0) {
        engine.spawnFloatText(engine.width / 2, engine.height * 0.35, '失误! 连击清零', '#c0392b');
        audio.soundComboBreak();
      }
      combo = 0;
      engine.score += CONFIG.catch.missPenalty;
      engine.spawnFloatText(topping.x, engine.cup.y - 20, '' + CONFIG.catch.missPenalty, '#c0392b');
    },

    getHud() {
      return {
        score: engine.score,
        timeLeft: engine.timeLeft,
        combo,
        comboActive: combo >= CONFIG.catch.comboThreshold,
        extra: { maxCombo },
      };
    },

    getResult() {
      let rating = '一般';
      if (engine.score >= 1400) rating = '优秀';
      else if (engine.score >= 900) rating = '良好';
      return {
        modeKey: 'catch',
        modeTitle: '纯接取模式',
        score: engine.score,
        rating,
        stats: [
          { label: '接住小料', value: stats.caught },
          { label: '漏接小料', value: stats.missed },
          { label: '最高连击', value: maxCombo },
        ],
      };
    },
  };
}
