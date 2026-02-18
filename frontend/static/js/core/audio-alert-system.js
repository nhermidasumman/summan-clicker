function createSafeAudioContext() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  try {
    return new AudioCtx();
  } catch {
    return null;
  }
}

function playTone(ctx, frequency, durationMs, gainValue = 0.04, type = 'sine') {
  if (!ctx || ctx.state !== 'running') return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = gainValue;

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  const durationSec = Math.max(0.02, durationMs / 1000);

  gain.gain.setValueAtTime(gainValue, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

  oscillator.start(now);
  oscillator.stop(now + durationSec);
}

export function createAlertAudioSystem() {
  const ctx = createSafeAudioContext();

  let alerted70 = false;
  let alerted90 = false;
  let crashAnnounced = false;

  function canPlay(state) {
    return Boolean(state?.settings?.audioEnabled !== false && ctx && ctx.state === 'running');
  }

  function unlock() {
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  function notifyDebt(efficiency, state) {
    if (!canPlay(state)) return;

    const debtPct = 100 - Math.max(0, Math.min(1, Number(efficiency || 1))) * 100;

    if (debtPct >= 90 && !alerted90) {
      playTone(ctx, 180, 220, 0.05, 'sawtooth');
      setTimeout(() => playTone(ctx, 140, 260, 0.05, 'sawtooth'), 120);
      alerted90 = true;
      alerted70 = true;
      return;
    }

    if (debtPct >= 70 && debtPct < 90 && !alerted70) {
      playTone(ctx, 360, 180, 0.035, 'triangle');
      alerted70 = true;
      return;
    }

    if (debtPct < 70) {
      alerted70 = false;
      alerted90 = false;
    }
  }

  function notifyCrashStart(state) {
    if (!canPlay(state) || crashAnnounced) return;
    playTone(ctx, 90, 300, 0.06, 'square');
    setTimeout(() => playTone(ctx, 70, 320, 0.06, 'square'), 180);
    crashAnnounced = true;
  }

  function notifyCrashEnd() {
    crashAnnounced = false;
  }

  return {
    unlock,
    notifyDebt,
    notifyCrashStart,
    notifyCrashEnd,
  };
}
