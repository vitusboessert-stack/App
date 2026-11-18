// Gentle 16-bit style Web Audio API sound effects (zero external assets required)
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'triangle',
  gainVal = 0.06,
  delay = 0
) {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(gainVal, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function playSfx(
  kind: 'quest' | 'level' | 'hit' | 'hatch' | 'slip' | 'equip',
  enabled: boolean
) {
  if (!enabled) return;
  try {
    if (kind === 'quest') {
      playTone(523.25, 0.1, 'triangle', 0.06, 0);
      playTone(659.25, 0.14, 'triangle', 0.06, 0.07);
    } else if (kind === 'level') {
      playTone(523.25, 0.1, 'square', 0.04, 0);
      playTone(659.25, 0.1, 'square', 0.04, 0.08);
      playTone(783.99, 0.12, 'square', 0.04, 0.16);
      playTone(1046.5, 0.25, 'triangle', 0.06, 0.24);
    } else if (kind === 'hit') {
      playTone(220, 0.09, 'sawtooth', 0.05, 0);
      playTone(146.83, 0.15, 'sawtooth', 0.05, 0.06);
    } else if (kind === 'hatch') {
      playTone(440, 0.1, 'triangle', 0.05, 0);
      playTone(554.37, 0.1, 'triangle', 0.05, 0.08);
      playTone(880, 0.2, 'triangle', 0.06, 0.16);
    } else if (kind === 'slip') {
      playTone(260, 0.12, 'sawtooth', 0.04, 0);
      playTone(196, 0.18, 'sawtooth', 0.04, 0.09);
    } else if (kind === 'equip') {
      playTone(392, 0.08, 'triangle', 0.04, 0);
      playTone(587.33, 0.1, 'triangle', 0.05, 0.05);
    }
  } catch {
    // Ignore audio context restriction errors
  }
}
