// ================= 游戏引擎（通用框架） =================
// 负责：画布与尺寸、主循环、输入、小料/粒子/飘字实体、模式策略分发
import { CONFIG, TOPPINGS } from './config.js';
import { createOrderMode } from './modes/orderMode.js';
import { createCatchMode } from './modes/catchMode.js';
import * as render from './render.js';
import * as audio from './audio.js';

export class GameEngine {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {'order'|'catch'} modeKey
   * @param {{onHud?: Function, onEnd?: Function}} callbacks
   */
  constructor(canvas, modeKey, callbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.callbacks = callbacks || {};

    this.state = 'idle'; // idle | playing | paused | ended
    this.width = 0;
    this.height = 0;

    this.cup = { x: 0, y: 0 };
    this.toppings = [];
    this.particles = [];
    this.floatTexts = [];

    // 输入
    this.keys = { a: false, d: false };
    this.pointerTargetX = null;
    this.lastInput = 'pointer';
    this.isDragging = false;
    this.dragOffsetX = 0;

    // 计时
    this.lastTime = 0;
    this.elapsed = 0;
    this.score = 0;
    this.timeLeft = CONFIG.gameDuration;
    this.toppingSpawnTimer = 0;

    // 模式策略
    this.mode = null;
    this.lastHudJson = '';

    this._rafId = null;
    this._handlers = {};
    this._bindEvents();
    this.setMode(modeKey);
    this.resize();
    this._loop = this._loop.bind(this);
    this._rafId = requestAnimationFrame(this._loop);
  }

  // ---------- 模式 ----------
  setMode(modeKey) {
    this.mode = modeKey === 'order' ? createOrderMode(this) : createCatchMode(this);
  }

  // ---------- 流程控制 ----------
  start(modeKey) {
    audio.initAudio();
    if (modeKey) this.setMode(modeKey);
    this.state = 'playing';
    this.score = 0;
    this.timeLeft = CONFIG.gameDuration;
    this.elapsed = 0;
    this.toppings = [];
    this.particles = [];
    this.floatTexts = [];
    this.toppingSpawnTimer = 0.3;
    this.pointerTargetX = null;
    this.cup.x = this.width / 2;
    this.cup.y = this.height - CONFIG.cup.bottomMargin - CONFIG.cup.height;
    this.mode.reset();
    this.lastTime = 0;
    this.lastHudJson = '';
    this.pushHud(true);
  }

  pause() {
    if (this.state === 'playing') this.state = 'paused';
  }

  resume() {
    if (this.state === 'paused') {
      this.state = 'playing';
      this.lastTime = 0;
    }
  }

  quit() {
    if (this.state === 'playing' || this.state === 'paused') {
      this.endGame();
    }
  }

  destroy() {
    cancelAnimationFrame(this._rafId);
    this._unbindEvents();
  }

  // ---------- 尺寸 ----------
  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    if (this.state !== 'playing') {
      this.cup.x = this.width / 2;
      this.cup.y = this.height - CONFIG.cup.bottomMargin - CONFIG.cup.height;
    }
  }

  // ---------- 实体 ----------
  spawnTopping() {
    const tpl = TOPPINGS[Math.floor(Math.random() * TOPPINGS.length)];
    const x = 40 + Math.random() * (this.width - 80);
    const speed = this.mode.getCurrentToppingSpeed();
    this.toppings.push({
      x: x,
      y: 110,
      vy: speed,
      type: tpl.id,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 3,
    });
  }

  spawnParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      const speed = 80 + Math.random() * 100;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        life: 0.6,
        maxLife: 0.6,
        color: color,
        size: 3 + Math.random() * 3,
      });
    }
  }

  spawnFloatText(x, y, text, color) {
    this.floatTexts.push({
      x, y,
      text, color,
      life: 1.0,
      maxLife: 1.0,
      vy: -60,
    });
  }

  // ---------- 更新 ----------
  update(dt) {
    this.elapsed = CONFIG.gameDuration - this.timeLeft;

    // 时间
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.pushHud(true);
      this.endGame();
      return;
    }

    // 杯子控制
    if (this.lastInput === 'pointer' && this.pointerTargetX !== null) {
      this.cup.x = this.pointerTargetX;
    } else {
      if (this.keys.a) this.cup.x -= CONFIG.cup.keySpeed * dt;
      if (this.keys.d) this.cup.x += CONFIG.cup.keySpeed * dt;
    }
    this.cup.x = Math.max(
      CONFIG.cup.width / 2 + 4,
      Math.min(this.width - CONFIG.cup.width / 2 - 4, this.cup.x)
    );

    // 小料生成
    this.toppingSpawnTimer -= dt;
    if (this.toppingSpawnTimer <= 0) {
      this.spawnTopping();
      const interval = Math.max(
        CONFIG.topping.minSpawnInterval,
        CONFIG.topping.baseSpawnInterval - this.elapsed * CONFIG.topping.spawnDecayPerSec
      );
      this.toppingSpawnTimer = interval * (0.85 + Math.random() * 0.3);
    }

    // 更新小料 + 碰撞
    for (let i = this.toppings.length - 1; i >= 0; i--) {
      const t = this.toppings[i];
      t.y += t.vy * dt;
      t.rotation += t.rotationSpeed * dt;

      const cupTop = this.cup.y;
      const cupBottom = this.cup.y + CONFIG.cup.height;
      const cupLeft = this.cup.x - CONFIG.cup.width / 2 + 6;
      const cupRight = this.cup.x + CONFIG.cup.width / 2 - 6;

      if (t.y + CONFIG.topping.radius >= cupTop && t.y < cupBottom) {
        if (t.x >= cupLeft && t.x <= cupRight) {
          this.mode.handleCatch(t);
          this.toppings.splice(i, 1);
          continue;
        }
      }

      // 漏接：掉出屏幕底部
      if (t.y - CONFIG.topping.radius > this.height) {
        this.mode.handleMiss(t);
        this.toppings.splice(i, 1);
      }
    }

    // 模式专属逻辑
    this.mode.update(dt);

    // 更新粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 400 * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // 更新飘字
    for (let i = this.floatTexts.length - 1; i >= 0; i--) {
      const ft = this.floatTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatTexts.splice(i, 1);
    }

    this.pushHud();
  }

  pushHud(force = false) {
    const hud = this.mode.getHud();
    const json = JSON.stringify(hud);
    if (force || json !== this.lastHudJson) {
      this.lastHudJson = json;
      if (this.callbacks.onHud) this.callbacks.onHud(hud);
    }
  }

  endGame() {
    if (this.state === 'ended') return;
    this.state = 'ended';
    if (this.callbacks.onEnd) this.callbacks.onEnd(this.mode.getResult());
  }

  // ---------- 渲染 ----------
  render() {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);
    render.drawBackground(ctx, width, height);

    // 模式中层 UI（订单卡 / 连击横幅）
    this.mode.renderCards(ctx);

    // 小料
    this.toppings.forEach((t) => render.drawTopping(ctx, t));

    // 杯子
    render.drawCup(ctx, this.cup);

    // 粒子 / 飘字
    render.drawParticles(ctx, this.particles);
    render.drawFloatTexts(ctx, this.floatTexts);
  }

  // ---------- 主循环 ----------
  _loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    let dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    if (dt > 0.1) dt = 0.1;

    if (this.state === 'playing') {
      this.update(dt);
    }
    this.render();

    this._rafId = requestAnimationFrame(this._loop);
  }

  // ---------- 事件 ----------
  _bindEvents() {
    const canvas = this.canvas;

    const onPointerDown = (e) => {
      if (this.state !== 'playing') return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const w = CONFIG.cup.width;
      const h = CONFIG.cup.height;
      const left = this.cup.x - w / 2 - 10;
      const right = this.cup.x + w / 2 + 10;
      const top = this.cup.y - 20;
      const bottom = this.cup.y + h + 10;

      if (mx >= left && mx <= right && my >= top && my <= bottom) {
        this.isDragging = true;
        this.dragOffsetX = mx - this.cup.x;
        this.lastInput = 'pointer';
        this.pointerTargetX = this.cup.x;
        try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      }
    };

    const onPointerMove = (e) => {
      if (this.state !== 'playing' || !this.isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      this.pointerTargetX = mx - this.dragOffsetX;
      this.lastInput = 'pointer';
    };

    const onPointerUp = (e) => {
      if (this.isDragging) {
        try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
      }
      this.isDragging = false;
    };

    const onPointerCancel = (e) => {
      if (this.isDragging) {
        try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
      }
      this.isDragging = false;
    };

    // 窗口失焦时强制释放拖拽，防止状态卡死
    const onBlur = () => {
      this.isDragging = false;
    };

    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'a') { this.keys.a = true; this.lastInput = 'keyboard'; }
      if (k === 'd') { this.keys.d = true; this.lastInput = 'keyboard'; }
    };

    const onKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'a') this.keys.a = false;
      if (k === 'd') this.keys.d = false;
    };

    const onResize = () => this.resize();

    this._handlers = { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onBlur, onKeyDown, onKeyUp, onResize };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerCancel);
    window.addEventListener('blur', onBlur);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onResize);
  }

  _unbindEvents() {
    const canvas = this.canvas;
    const h = this._handlers;
    canvas.removeEventListener('pointerdown', h.onPointerDown);
    canvas.removeEventListener('pointermove', h.onPointerMove);
    canvas.removeEventListener('pointerup', h.onPointerUp);
    canvas.removeEventListener('pointercancel', h.onPointerCancel);
    window.removeEventListener('blur', h.onBlur);
    document.removeEventListener('keydown', h.onKeyDown);
    document.removeEventListener('keyup', h.onKeyUp);
    window.removeEventListener('resize', h.onResize);
  }
}
