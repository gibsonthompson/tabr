import { NOTE_NAMES } from './theory';

export type DetectedPitch = { hz: number; clarity: number };
export type NearestNote = { name: string; octave: number; targetHz: number; cents: number };

const MIN_HZ = 55; // below Drop C low string (65.4 Hz) with margin
const MAX_HZ = 1400;
const MIN_RMS = 0.008; // silence gate
const MIN_CLARITY = 0.8; // reject noisy frames

/**
 * McLeod Pitch Method (normalized square difference function) on one mono frame.
 * Cost is O(window * maxLag), bounded by MIN_HZ so it stays fast enough in JS.
 */
export function detectPitch(samples: Float32Array, sampleRate: number): DetectedPitch | null {
  const n = samples.length;
  let rms = 0;
  for (let i = 0; i < n; i++) rms += samples[i] * samples[i];
  rms = Math.sqrt(rms / n);
  if (rms < MIN_RMS) return null;

  const maxLag = Math.min(Math.floor(sampleRate / MIN_HZ), Math.floor(n / 2));
  const minLag = Math.max(2, Math.floor(sampleRate / MAX_HZ));
  const w = n - maxLag;
  if (w < 64) return null;

  const nsdf = new Float32Array(maxLag + 1);
  for (let tau = 0; tau <= maxLag; tau++) {
    let acf = 0;
    let m = 0;
    for (let i = 0; i < w; i++) {
      const a = samples[i];
      const b = samples[i + tau];
      acf += a * b;
      m += a * a + b * b;
    }
    nsdf[tau] = m > 0 ? (2 * acf) / m : 0;
  }

  // Collect the highest peak of each positive region after the first downward zero crossing.
  const peaks: number[] = [];
  let tau = minLag;
  while (tau < maxLag && nsdf[tau] > 0) tau++;
  let regionMax = -1;
  let regionIdx = -1;
  for (; tau < maxLag; tau++) {
    if (nsdf[tau] > 0) {
      if (nsdf[tau] > regionMax) {
        regionMax = nsdf[tau];
        regionIdx = tau;
      }
    } else if (regionIdx >= 0) {
      peaks.push(regionIdx);
      regionMax = -1;
      regionIdx = -1;
    }
  }
  if (regionIdx >= 0) peaks.push(regionIdx);
  if (!peaks.length) return null;

  const best = Math.max(...peaks.map((p) => nsdf[p]));
  const chosen = peaks.find((p) => nsdf[p] >= 0.9 * best) ?? peaks[0];
  const clarity = nsdf[chosen];
  if (clarity < MIN_CLARITY) return null;

  // Parabolic interpolation around the chosen lag.
  const x1 = nsdf[chosen - 1] ?? clarity;
  const x2 = clarity;
  const x3 = nsdf[chosen + 1] ?? clarity;
  const denom = x1 - 2 * x2 + x3;
  const shift = denom !== 0 ? (0.5 * (x1 - x3)) / denom : 0;
  const period = chosen + shift;
  const hz = sampleRate / period;
  if (hz < MIN_HZ || hz > MAX_HZ) return null;
  return { hz, clarity };
}

export function nearestNote(hz: number, a4 = 440): NearestNote {
  const semis = Math.round(12 * Math.log2(hz / a4));
  const targetHz = a4 * Math.pow(2, semis / 12);
  const midi = 69 + semis;
  return {
    name: NOTE_NAMES[((midi % 12) + 12) % 12],
    octave: Math.floor(midi / 12) - 1,
    targetHz,
    cents: Math.round(1200 * Math.log2(hz / targetHz)),
  };
}

export function centsBetween(hz: number, targetHz: number): number {
  return Math.round(1200 * Math.log2(hz / targetHz));
}

/** Median of the last few readings, to steady the needle. */
export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
