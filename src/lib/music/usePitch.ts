import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioManager, AudioRecorder } from 'react-native-audio-api';
import { detectPitch, median } from './pitch';

export type MicState = 'idle' | 'starting' | 'listening' | 'denied' | 'error';

const SAMPLE_RATE = 22050;
const BUFFER = 2048; // ~93 ms per frame, long enough for a 65 Hz low C
const SMOOTHING = 3;

/**
 * Live pitch from the microphone. Audio is analyzed on the device and never stored or sent anywhere.
 */
export function usePitch() {
  const [state, setState] = useState<MicState>('idle');
  const [hz, setHz] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorder = useRef<AudioRecorder | null>(null);
  const recent = useRef<number[]>([]);
  const silentFrames = useRef(0);

  const stop = useCallback(async () => {
    const r = recorder.current;
    recorder.current = null;
    recent.current = [];
    setHz(null);
    setState('idle');
    if (!r) return;
    try {
      r.clearOnAudioReady();
      await r.stop();
    } catch {}
    try {
      await AudioManager.setAudioSessionActivity(false);
    } catch {}
  }, []);

  const start = useCallback(async () => {
    if (recorder.current) return;
    setError(null);
    setState('starting');
    try {
      const permission = await AudioManager.requestRecordingPermissions();
      if (permission !== 'Granted') {
        setState('denied');
        return;
      }
      AudioManager.setSystemOptions({ ios: { category: 'record', mode: 'measurement', options: [] } });
      await AudioManager.setAudioSessionActivity(true);

      const r = new AudioRecorder();
      const result = await r.start();
      if (result.status === 'error') throw new Error(result.message);

      r.onAudioReady({ sampleRate: SAMPLE_RATE, bufferLength: BUFFER, channelCount: 1 }, ({ buffer }) => {
        const frame = buffer.getChannelData(0);
        const pitch = detectPitch(frame, buffer.sampleRate);
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
      });

      recorder.current = r;
      setState('listening');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start the microphone');
      setState('error');
      await stop();
      setState('error');
    }
  }, [stop]);

  useEffect(() => () => void stop(), [stop]);

  return { state, hz, error, start, stop };
}
