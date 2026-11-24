import { useCallback, useEffect, useRef, useState } from 'react';
import { detectPitch, median } from './pitch';

export type MicState = 'idle' | 'starting' | 'listening' | 'denied' | 'error';

const FRAME = 2048; // samples analyzed per reading, after downsampling
const TARGET_RATE = 24000; // ~85 ms per frame, long enough for a 65 Hz low C
const SMOOTHING = 3;
const INTERVAL_MS = 60;

/**
 * Browser version of the tuner's microphone input. Uses the computer's mic through the Web Audio API.
 * Same pitch detection as the phone app. Audio is analyzed in the browser and never stored or sent anywhere.
 */
export function usePitch() {
  const [state, setState] = useState<MicState>('idle');
  const [hz, setHz] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const live = useRef<{ ctx: AudioContext; stream: MediaStream; timer: ReturnType<typeof setInterval> } | null>(null);
  const recent = useRef<number[]>([]);
  const silentFrames = useRef(0);

  const stop = useCallback(async () => {
    const l = live.current;
    live.current = null;
    recent.current = [];
    setHz(null);
    setState('idle');
    if (!l) return;
    clearInterval(l.timer);
    l.stream.getTracks().forEach((t) => t.stop());
    try {
      await l.ctx.close();
    } catch {}
  }, []);

  const start = useCallback(async () => {
    if (live.current) return;
    setError(null);
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('This browser does not allow microphone access. Try Chrome, Safari or Edge.');
      setState('error');
      return;
    }
    setState('starting');
    let stream: MediaStream;
    try {
      // Turn off voice processing so the guitar's pitch reaches the detector untouched.
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch (e) {
      const name = e instanceof DOMException ? e.name : '';
      if (name === 'NotAllowedError' || name === 'SecurityError') setState('denied');
      else {
        setError(name === 'NotFoundError' ? 'No microphone was found on this computer.' : 'Could not start the microphone.');
        setState('error');
      }
      return;
    }

    try {
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      const step = Math.max(1, Math.round(ctx.sampleRate / TARGET_RATE));
      analyser.fftSize = Math.min(32768, 2 ** Math.ceil(Math.log2(FRAME * step)));
      source.connect(analyser);
      const raw = new Float32Array(analyser.fftSize);
      const frame = new Float32Array(FRAME);
      const rate = ctx.sampleRate / step;

      const timer = setInterval(() => {
        analyser.getFloatTimeDomainData(raw);
        // Average neighboring samples to bring 44.1/48 kHz down near 24 kHz; keeps detection fast.
        const offset = raw.length - FRAME * step;
        for (let i = 0; i < FRAME; i++) {
          let sum = 0;
          for (let k = 0; k < step; k++) sum += raw[offset + i * step + k];
          frame[i] = sum / step;
        }
        const pitch = detectPitch(frame, rate);
        if (!pitch) {
          // Hold the last reading briefly so the needle doesn't flicker between plucks.
          if (++silentFrames.current > 8) {
            recent.current = [];
            setHz(null);
          }
          return;
        }
        silentFrames.current = 0;
        recent.current = [...recent.current, pitch.hz].slice(-SMOOTHING);
        setHz(median(recent.current));
      }, INTERVAL_MS);

      live.current = { ctx, stream, timer };
      setState('listening');
    } catch (e) {
      stream.getTracks().forEach((t) => t.stop());
      setError(e instanceof Error ? e.message : 'Could not start the microphone.');
      setState('error');
    }
  }, []);

  useEffect(() => () => void stop(), [stop]);

  return { state, hz, error, start, stop };
}
