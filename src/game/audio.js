// ================= 音频（Web Audio API） =================
let audioCtx = null;

export function initAudio() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('无音频支持');
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

export function playSound(freq, duration, type = 'sine', volume = 0.1, freqEnd = null) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, now + duration);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

export function soundCorrect() {
  playSound(880, 0.12, 'sine', 0.1, 1100);
  setTimeout(() => playSound(1200, 0.15, 'sine', 0.08, 1400), 80);
}

export function soundWrong() {
  playSound(200, 0.25, 'triangle', 0.12, 100);
}

export function soundOrderComplete() {
  playSound(660, 0.1, 'sine', 0.08, 880);
  setTimeout(() => playSound(880, 0.1, 'sine', 0.08, 1100), 90);
  setTimeout(() => playSound(1100, 0.18, 'sine', 0.08, 1320), 180);
}

// 进入连击状态
export function soundComboUp() {
  playSound(660, 0.1, 'sine', 0.1, 880);
  setTimeout(() => playSound(990, 0.12, 'sine', 0.1, 1320), 90);
  setTimeout(() => playSound(1320, 0.2, 'sine', 0.08, 1760), 180);
}

// 连击中断
export function soundComboBreak() {
  playSound(150, 0.3, 'sawtooth', 0.1, 60);
}
