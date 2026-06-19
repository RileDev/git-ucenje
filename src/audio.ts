// Shared Web Audio context. Browsers limit the number of AudioContexts per page
// (a fresh one per tone would eventually be rejected and leak resources), so we
// lazily create exactly one and reuse it for the lifetime of the app.

let audioCtx: AudioContext | null = null;

const getCtx = (): AudioContext | null => {
  if (audioCtx && audioCtx.state !== 'closed') return audioCtx;
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
    return audioCtx;
  } catch (e) {
    console.error('Audio Context nije podržan ili je blokiran:', e);
    return null;
  }
};

export const playTone = (
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.15
) => {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  const t0 = ctx.currentTime + Math.max(0, startTime);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration);
};

export const playXpStartup = () => {
  // Eb -> Ab -> Eb harmonija
  playTone(311.13, 0,    2.0, 'sine', 0.12);
  playTone(392.00, 0.12, 1.8, 'sine', 0.12);
  playTone(466.16, 0.24, 1.6, 'sine', 0.12);
  playTone(622.25, 0.36, 1.4, 'sine', 0.12);
  playTone(783.99, 0.48, 1.2, 'sine', 0.12);
  playTone(932.33, 0.64, 0.9, 'sine', 0.12);
};

export const playXpError = () => {
  playTone(150, 0, 0.25, 'sawtooth', 0.15);
};

export const playXpSuccess = () => {
  playTone(523.25,  0,    0.3, 'triangle', 0.12);
  playTone(659.25,  0.08, 0.3, 'triangle', 0.12);
  playTone(783.99,  0.16, 0.3, 'triangle', 0.12);
  playTone(1046.50, 0.24, 0.7, 'triangle', 0.12);
};
