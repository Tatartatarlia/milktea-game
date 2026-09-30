// ================= 配置参数 =================
// 通用配置
export const CONFIG = {
  gameDuration: 60,
  cup: {
    width: 110,
    height: 85,
    bottomMargin: 40,
    keySpeed: 720,
  },
  topping: {
    baseSpeed: 200,
    speedPerSec: 2.2,
    baseSpawnInterval: 0.72,
    minSpawnInterval: 0.38,
    spawnDecayPerSec: 0.006,
    radius: 16,
  },
  // 订单模式配置（原玩法）
  order: {
    maxActive: 2,
    durationMin: 6,
    durationMax: 10,
    spawnIntervalMin: 1.8,
    spawnIntervalMax: 3.2,
    correctScore: 10,
    wrongScore: -5,
    earlyBonus: 5,
  },
  // 纯接取模式配置
  catch: {
    catchScore: 10,        // 接到任意小料的基础分
    comboThreshold: 5,     // 连续接住 5 个进入连击状态
    comboMultiplier: 2,    // 连击状态下分数翻倍
    missPenalty: -5,       // 漏接扣分
    speedPerCombo: 12,     // 每 1 点连击额外增加的下落速度
  },
};

// 模式定义（主菜单展示用）
export const MODES = [
  {
    key: 'order',
    title: '订单模式',
    icon: '📋',
    desc: '原版玩法：小料从上方掉落，拖动杯子接住顾客要的那一种。接对 +10 分，接错 -5 分，订单时限过半内完成额外 +5 分。',
    color: '#c87f3a',
  },
  {
    key: 'catch',
    title: '纯接取模式',
    icon: '🔥',
    desc: '接到任意小料 +10 分；连续接住 5 个进入连击状态，分数翻倍！接错（漏接）一次连击归零；连击越高，小料下落越快。',
    color: '#d35400',
  },
];

export const TOPPINGS = [
  { id: 'pearl',   name: '珍珠', color: '#3d2010', accent: '#1a0c04' },
  { id: 'coconut', name: '椰果', color: '#f5efe0', accent: '#c8bda0' },
  { id: 'redbean', name: '红豆', color: '#922e1e', accent: '#5c1a10' },
];
