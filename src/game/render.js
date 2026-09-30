// ================= 绘制函数（Canvas） =================
import { CONFIG, TOPPINGS } from './config.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function drawBackground(ctx, width, height) {
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#fff8ec');
  grad.addColorStop(1, '#f5e0c0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 装饰性花纹
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#a0522d';
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(width * (0.1 + i * 0.16), height * 0.4, 60, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 桌面
  ctx.fillStyle = '#d8b88a';
  ctx.fillRect(0, height - 20, width, 20);
  ctx.fillStyle = '#b88f5a';
  ctx.fillRect(0, height - 20, width, 4);
}

export function drawToppingShape(ctx, tpl, x, y, size, rotation = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  if (tpl.id === 'pearl') {
    const g = ctx.createRadialGradient(-size * 0.3, -size * 0.3, 2, 0, 0, size);
    g.addColorStop(0, '#6a3818');
    g.addColorStop(1, '#1a0c04');
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-size * 0.35, -size * 0.35, size * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();
  } else if (tpl.id === 'coconut') {
    roundRect(ctx, -size, -size, size * 2, size * 2, 4);
    ctx.fillStyle = '#f5efe0';
    ctx.fill();
    ctx.strokeStyle = '#c8bda0';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillRect(-size * 0.6, -size * 0.6, size * 0.5, size * 0.5);
  } else if (tpl.id === 'redbean') {
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 1.1, size * 0.8, 0.3, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(-size * 0.3, -size * 0.3, 2, 0, 0, size);
    g.addColorStop(0, '#b04434');
    g.addColorStop(1, '#6b1f13');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#4a1208';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.restore();
}

export function drawTopping(ctx, t) {
  const tpl = TOPPINGS.find((x) => x.id === t.type);
  drawToppingShape(ctx, tpl, t.x, t.y, CONFIG.topping.radius, t.rotation);
}

export function drawCup(ctx, cup) {
  const w = CONFIG.cup.width;
  const h = CONFIG.cup.height;
  const x = cup.x;
  const y = cup.y;

  // 杯身
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w / 2 - 10, y + h);
  ctx.lineTo(x - w / 2 + 10, y + h);
  ctx.closePath();

  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, '#fcebd0');
  grad.addColorStop(1, '#d4a878');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#8b6a45';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 奶茶内容（底层）
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - w / 2 + 6, y + h * 0.35);
  ctx.lineTo(x + w / 2 - 6, y + h * 0.35);
  ctx.lineTo(x + w / 2 - 10, y + h - 4);
  ctx.lineTo(x - w / 2 + 10, y + h - 4);
  ctx.closePath();
  ctx.fillStyle = 'rgba(180, 120, 70, 0.5)';
  ctx.fill();
  ctx.restore();

  // 杯口
  ctx.beginPath();
  ctx.ellipse(x, y, w / 2, 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#fdf0dc';
  ctx.fill();
  ctx.strokeStyle = '#8b6a45';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 吸管
  ctx.beginPath();
  ctx.moveTo(x + 14, y - 48);
  ctx.lineTo(x + 6, y + 20);
  ctx.strokeStyle = '#e74c3c';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 高光
  ctx.beginPath();
  ctx.moveTo(x - w / 2 + 14, y + 15);
  ctx.lineTo(x - w / 2 + 20, y + h - 15);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();
}

// 订单卡片（订单模式使用）
export function drawOrderCard(ctx, order, index, width) {
  const cardW = Math.min(210, width * 0.45);
  const cardH = 80;
  const padding = 12;
  const x = padding + index * (cardW + padding);
  const y = 60;

  // 卡片背景
  ctx.save();
  // 快过期抖动
  const timeRatio = order.timeLeft / order.duration;
  let shakeX = 0;
  if (timeRatio < 0.3) {
    shakeX = Math.sin(order.shakePhase * 3) * 2;
  }
  ctx.translate(shakeX, 0);

  // 阴影
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  roundRect(ctx, x + 2, y + 3, cardW, cardH, 12);
  ctx.fill();

  // 卡片主体
  roundRect(ctx, x, y, cardW, cardH, 12);
  ctx.fillStyle = '#fff8ec';
  ctx.fill();
  ctx.strokeStyle = timeRatio < 0.3 ? '#c0392b' : '#d4a373';
  ctx.lineWidth = timeRatio < 0.3 ? 3 : 2;
  ctx.stroke();

  // 顾客头像
  const avatarX = x + 32;
  const avatarY = y + cardH / 2;
  const avatarR = 22;

  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
  const avatarColors = ['#f5b8a0', '#f0d4a0', '#d8b8e0', '#a8d0e0'];
  ctx.fillStyle = avatarColors[order.avatarSeed % avatarColors.length];
  ctx.fill();
  ctx.strokeStyle = '#8b6a45';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 简单表情
  ctx.fillStyle = '#4a3520';
  ctx.beginPath();
  ctx.arc(avatarX - 7, avatarY - 4, 2.5, 0, Math.PI * 2);
  ctx.arc(avatarX + 7, avatarY - 4, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(avatarX, avatarY + 5, 6, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.strokeStyle = '#4a3520';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 需求小料图标
  const tpl = TOPPINGS.find((t) => t.id === order.toppingId);
  const iconX = x + 75;
  const iconY = y + 30;
  drawToppingShape(ctx, tpl, iconX, iconY, 14, 0);

  // 需求文字
  ctx.fillStyle = '#6b4226';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('要 ' + order.toppingName, iconX + 20, iconY);

  // 时间条
  const barX = x + 70;
  const barY = y + 52;
  const barW = cardW - 85;
  const barH = 8;
  ctx.fillStyle = '#eee0cc';
  roundRect(ctx, barX, barY, barW, barH, 4);
  ctx.fill();

  ctx.fillStyle = timeRatio < 0.3 ? '#c0392b' : (timeRatio < 0.6 ? '#e67e22' : '#27ae60');
  roundRect(ctx, barX, barY, barW * timeRatio, barH, 4);
  ctx.fill();

  ctx.restore();
}

export function drawParticles(ctx, particles) {
  particles.forEach((p) => {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

export function drawFloatTexts(ctx, floatTexts) {
  floatTexts.forEach((ft) => {
    ctx.globalAlpha = ft.life / ft.maxLife;
    ctx.fillStyle = ft.color;
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 4;
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillText(ft.text, ft.x, ft.y);
  });
  ctx.globalAlpha = 1;
}
