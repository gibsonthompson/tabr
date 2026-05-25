import { useState, useEffect, useRef, useCallback } from "react";
import { closestNote, autoCorrelate, TUNINGS } from "../lib/tuner";

export default function TunerPanel() {
  const [active, setActive] = useState(false);
  const [note, setNote] = useState(null);
  const [tuningId, setTuningId] = useState("standard");
  const [selectedString, setSelectedString] = useState(null);
  const rafRef = useRef(null);
  const ctxRef = useRef(null);
  const streamRef = useRef(null);

  const tuning = TUNINGS.find((t) => t.id === tuningId);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      src.connect(analyser);
      setActive(true);

      const buf = new Float32Array(analyser.fftSize);
      const tick = () => {
        analyser.getFloatTimeDomainData(buf);
        const hz = autoCorrelate(buf, ctx.sampleRate);
        if (hz > 50 && hz < 1200) {
          const detected = closestNote(hz);
          setNote(detected);
          // Auto-detect which string is closest
          if (tuning) {
            let closest = 0, minDiff = Infinity;
            tuning.strings.forEach((s, i) => {
              const diff = Math.abs(hz - s.hz);
              if (diff < minDiff) { minDiff = diff; closest = i; }
            });
            setSelectedString(closest);
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      console.error("Mic access failed:", e);
    }
  }, [tuning]);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (ctxRef.current) ctxRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    setActive(false);
    setNote(null);
    setSelectedString(null);
  }, []);

  useEffect(() => () => { if (active) stop(); }, []);

  const centsColor = (c) => {
    if (Math.abs(c) <= 5) return "#8FBC44";
    if (Math.abs(c) <= 15) return "#D4AF37";
    return "#C41E3A";
  };

  const inTune = note && Math.abs(note.cents) <= 5;
  const gaugeAngle = note ? Math.max(-45, Math.min(45, note.cents * 0.9)) : 0;

  return (
    <div>
      {/* Tuning selector */}
      <div className="tuning-selector">
        <select
          value={tuningId}
          onChange={(e) => setTuningId(e.target.value)}
          className="tuning-select"
        >
          {TUNINGS.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <p className="tuning-desc">{tuning?.desc}</p>
      </div>

      {/* String buttons — visual representation */}
      <div className="tuner-strings">
        {tuning?.strings.map((s, i) => {
          const isSelected = selectedString === i;
          const stringNum = 6 - i; // 6th = thickest, 1st = thinnest
          return (
            <button
              key={i}
              onClick={() => setSelectedString(i)}
              className={`tuner-string-btn ${isSelected ? "tuner-string-active" : ""}`}
              style={{
                borderColor: isSelected
                  ? (inTune ? "#8FBC44" : "#D4AF37")
                  : "rgba(212,175,55,0.15)",
                background: isSelected
                  ? (inTune ? "rgba(143,188,68,0.15)" : "rgba(212,175,55,0.1)")
                  : "rgba(42,18,8,0.5)",
              }}
            >
              <span className="tuner-string-note" style={{ color: isSelected ? (inTune ? "#8FBC44" : "#D4AF37") : "#8B7355" }}>
                {s.name}
              </span>
              <span className="tuner-string-num">{stringNum}</span>
              <span className="tuner-string-hz">{s.hz} Hz</span>
            </button>
          );
        })}
      </div>

      {/* Circular gauge */}
      <div className="tuner-gauge-wrap">
        <svg viewBox="0 0 200 120" width="260" className="tuner-gauge-svg">
          {/* Arc background */}
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(42,18,8,0.8)" strokeWidth={8} strokeLinecap="round" />

          {/* Colored zones */}
          <path d="M 75 28 A 80 80 0 0 1 125 28" fill="none" stroke="rgba(143,188,68,0.3)" strokeWidth={8} strokeLinecap="round" />

          {/* Center tick */}
          <line x1="100" y1="18" x2="100" y2="28" stroke="#8FBC44" strokeWidth={2} />

          {/* Needle */}
          {active && note && (
            <line
              x1="100"
              y1="100"
              x2={100 + 70 * Math.sin((gaugeAngle * Math.PI) / 180)}
              y2={100 - 70 * Math.cos((gaugeAngle * Math.PI) / 180)}
              stroke={centsColor(note.cents)}
              strokeWidth={2.5}
              strokeLinecap="round"
              style={{ transition: "all 0.12s ease-out" }}
            />
          )}

          {/* Center dot */}
          <circle cx="100" cy="100" r="5" fill={active && note ? centsColor(note.cents) : "#6B5940"} />

          {/* Labels */}
          <text x="25" y="112" fill="#6B5940" fontSize="9" fontFamily="monospace">FLAT</text>
          <text x="155" y="112" fill="#6B5940" fontSize="9" fontFamily="monospace">SHARP</text>
        </svg>

        {/* Detected note display */}
        <div className="tuner-note-display">
          {active && note ? (
            <>
              <span className="tuner-detected-note" style={{ color: centsColor(note.cents) }}>
                {note.name}<span className="tuner-detected-oct">{note.oct}</span>
              </span>
              <span className="tuner-detected-hz">{note.hz} Hz</span>
              <span className="tuner-detected-cents" style={{ color: centsColor(note.cents) }}>
                {inTune ? "IN TUNE" : `${note.cents > 0 ? "+" : ""}${note.cents} cents`}
              </span>
            </>
          ) : active ? (
            <span className="tuner-waiting-text">Play a string...</span>
          ) : (
            <span className="tuner-waiting-text">Tap start to begin</span>
          )}
        </div>
      </div>

      {/* Start / Stop */}
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button
          onClick={active ? stop : start}
          className={`tuner-btn ${active ? "tuner-btn-stop" : "tuner-btn-start"}`}
        >
          {active ? "STOP" : "START TUNER"}
        </button>
      </div>
    </div>
  );
}