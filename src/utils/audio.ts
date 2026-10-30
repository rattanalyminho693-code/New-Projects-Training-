/**
 * Web Audio API synthesizer for trading signal notifications
 */
export function playSignalChime(type: 'BUY' | 'SELL' | 'SUCCESS' | 'MT5_ORDER') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'BUY') {
      // Ascending chord (C5 -> E5 -> G5)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'SELL') {
      // Descending tone (G5 -> Eb5 -> C5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(783.99, now);
      osc.frequency.setValueAtTime(622.25, now + 0.08);
      osc.frequency.setValueAtTime(523.25, now + 0.16);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'MT5_ORDER') {
      // Distinct MT5 Order Execution Double Chime (C6 -> E6)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.50, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.09);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // Pleasant ping
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (err) {
    console.error('Audio playback error', err);
  }
}
