let audioCtx: AudioContext | null = null;

function ensureAudioContext(): AudioContext | null {
  if (!audioCtx) {
    const constructors = window as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const Ctor = constructors.AudioContext || constructors.webkitAudioContext;
    if (Ctor) audioCtx = new Ctor();
  }
  return audioCtx;
}

export function playRoboClick() {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  
  // Sharp digital blip
  const osc1 = ctx.createOscillator();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(100, now);
  osc1.frequency.exponentialRampToValueAtTime(100, now + 0.05);
  
  // High-frequency click accent
  const osc2 = ctx.createOscillator();
  osc2.type = "square";
  osc2.frequency.setValueAtTime(300, now);
  
  // Crisp envelope - very short and punchy
  const gain1 = ctx.createGain();
  gain1.gain.setValueAtTime(1, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  
  // Click accent gain - extremely short
  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.08, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
  
  // Tight bandpass for UI precision
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1500, now);
  filter.Q.setValueAtTime(2, now);
  
  // Connect audio graph
  osc1.connect(gain1);
  gain1.connect(filter);
  filter.connect(ctx.destination);
  
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  
  // Start and stop - very brief
  osc1.start(now);
  osc1.stop(now + 0.5);
  osc2.start(now);
  osc2.stop(now + 0.015);
}