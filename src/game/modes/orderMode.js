// ================= 订单模式（原玩法，规则保持不变） =================
import { CONFIG, TOPPINGS } from '../config.js';
import { drawOrderCard } from '../render.js';
import * as audio from '../audio.js';

export function createOrderMode(engine) {
  let orders = [];
  let orderSpawnTimer = 0.8;
  let stats = { orders: 0, correct: 0, wrong: 0 };

  function spawnOrder() {
    const tpl = TOPPINGS[Math.floor(Math.random() * TOPPINGS.length)];
    const duration =
      CONFIG.order.durationMin +
      Math.random() * (CONFIG.order.durationMax - CONFIG.order.durationMin);
    orders.push({
      toppingId: tpl.id,
      toppingName: tpl.name,
      duration: duration,
      timeLeft: duration,
      avatarSeed: Math.floor(Math.random() * 4),
      shakePhase: Math.random() * Math.PI * 2,
    });
  }

  return {
    key: 'order',

    reset() {
      orders = [];
      orderSpawnTimer = 0.8;
      stats = { orders: 0, correct: 0, wrong: 0 };
    },

    update(dt) {
      // 订单生成
      orderSpawnTimer -= dt;
      if (orderSpawnTimer <= 0 && orders.length < CONFIG.order.maxActive) {
        spawnOrder();
        orderSpawnTimer =
          CONFIG.order.spawnIntervalMin +
          Math.random() * (CONFIG.order.spawnIntervalMax - CONFIG.order.spawnIntervalMin);
      }

      // 更新订单
      for (let i = orders.length - 1; i >= 0; i--) {
        orders[i].timeLeft -= dt;
        orders[i].shakePhase += dt * 5;
        if (orders[i].timeLeft <= 0) {
          engine.spawnFloatText(engine.width / 2, engine.height / 2, '订单超时!', '#c0392b');
          orders.splice(i, 1);
        }
      }
    },

    // 订单卡片（背景之后、小料之前）
    renderCards(ctx) {
      orders.forEach((o, i) => drawOrderCard(ctx, o, i, engine.width));
    },

    // 小料下落速度：随时间逐渐加快（原逻辑）
    getCurrentToppingSpeed() {
      return CONFIG.topping.baseSpeed + engine.elapsed * CONFIG.topping.speedPerSec;
    },

    handleCatch(topping) {
      // 找匹配的订单
      let matchIndex = -1;
      for (let i = 0; i < orders.length; i++) {
        if (orders[i].toppingId === topping.type) {
          matchIndex = i;
          break;
        }
      }

      if (matchIndex >= 0) {
        const order = orders[matchIndex];
        const timeRatio = order.timeLeft / order.duration;
        let points = CONFIG.order.correctScore;
        let bonus = false;

        if (timeRatio > 0.5) {
          points += CONFIG.order.earlyBonus;
          bonus = true;
        }

        engine.score += points;
        stats.orders++;
        stats.correct++;

        const tpl = TOPPINGS.find((t) => t.id === topping.type);
        engine.spawnParticles(topping.x, engine.cup.y, tpl.color, 14);
        engine.spawnFloatText(
          topping.x,
          engine.cup.y - 20,
          '+' + points + (bonus ? ' 快!' : ''),
          bonus ? '#e67e22' : '#27ae60'
        );
        audio.soundOrderComplete();

        orders.splice(matchIndex, 1);
      } else {
        // 没有匹配订单，扣分
        engine.score += CONFIG.order.wrongScore;
        stats.wrong++;
        engine.spawnFloatText(topping.x, engine.cup.y - 20, '' + CONFIG.order.wrongScore, '#c0392b');
        audio.soundWrong();
      }
    },

    // 订单模式：漏接小料无额外惩罚（原逻辑）
    handleMiss() {},

    getHud() {
      return {
        score: engine.score,
        timeLeft: engine.timeLeft,
        combo: 0,
        comboActive: false,
        extra: { orders: stats.orders },
      };
    },

    getResult() {
      let rating = '一般';
      if (engine.score >= 300) rating = '优秀';
      else if (engine.score >= 200) rating = '良好';
      return {
        modeKey: 'order',
        modeTitle: '订单模式',
        score: engine.score,
        rating,
        stats: [
          { label: '完成订单', value: stats.orders },
          { label: '接对小料', value: stats.correct },
          { label: '接错小料', value: stats.wrong },
        ],
      };
    },
  };
}
