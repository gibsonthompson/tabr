import { useState, useEffect, useRef } from "react";
import "./App.css";
import { parseTabs, assignFingers, TECHNIQUE_INFO, SAMPLE_TAB, SAMPLE_TECHNIQUES } from "./lib/parser";
import { detectChord, STRINGS, FINGER_COLORS, getNoteName } from "./lib/music";
import { parseScreenshot } from "./lib/api";
import Fretboard from "./components/Fretboard";
import TunerPanel from "./components/TunerPanel";
import UploadZone from "./components/UploadZone";
import ChordLibrary from "./components/ChordLibrary";

export default function App() {
  const [tabText, setTabText] = useState(SAMPLE_TAB);
  const [steps, setSteps] = useState([]);
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [baseSpeed, setBaseSpeed] = useState(400);
  const [mode, setMode] = useState("paste");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [extracted, setExtracted] = useState(null);
  const [apiKey, setApiKey] = useState(() => import.meta.env.VITE_ANTHROPIC_API_KEY || "");
  const timeoutRef = useRef(null);

  useEffect(() => {
    const parsed = parseTabs(tabText);
    const withFingers = parsed.map((step) => ({ ...step, notes: assignFingers(step.notes) }));
    setSteps(withFingers);
    setCur(0);
    setPlaying(false);
  }, [tabText]);

  useEffect(() => {
    if (!playing || !steps.length) return;
    const currentStep = steps[cur];
    const weight = currentStep?.durationWeight || 4;
    const delay = baseSpeed * (weight / 4);
    timeoutRef.current = setTimeout(() => {
      setCur((p) => { if (p >= steps.length - 1) { setPlaying(false); return p; } return p + 1; });
    }, delay);
    return () => clearTimeout(timeoutRef.current);
  }, [playing, cur, baseSpeed, steps]);

  const handleScreenshot = async (b64, mt) => {
    if (!apiKey) { setStatus({ t: "error", m: "Add your Anthropic API key to use screenshot analysis." }); return; }
    setLoading(true); setStatus(null); setExtracted(null);
    try {
      const text = await parseScreenshot(b64, mt, apiKey);
      setExtracted(text); setTabText(text);
      const p = parseTabs(text);
      setStatus(p.length ? { t: "success", m: `Extracted ${p.length} steps from screenshot` } : { t: "warning", m: "Extracted text but no valid tab patterns found. Edit below." });
    } catch (e) { setStatus({ t: "error", m: `Failed: ${e.message}` }); }
    setLoading(false);
  };

  const notes = steps[cur]?.notes || [];
  const chordName = detectChord(notes);
  const pct = steps.length ? ((cur + 1) / steps.length) * 100 : 0;
  const statusColors = { success: "#8FBC44", warning: "#D4AF37", error: "#C41E3A" };
  const uniqueTechniques = [...new Set(notes.filter((n) => n.technique).map((n) => n.technique))];
  const showPlayer = mode !== "tuner" && mode !== "chords";

  return (
    <div className="app">
      <div className="ambient-1" />
      <div className="ambient-2" />

      <header className="header">
        <h1 className="logo">tabr</h1>
        <p className="tagline">AI-Powered Tab Visualizer + Tuner</p>
      </header>

      {/* Mode tabs */}
      <div className="mode-tabs">
        {[
          { id: "upload", label: "SCREENSHOT" },
          { id: "paste", label: "PASTE TAB" },
          { id: "chords", label: "CHORDS" },
          { id: "tuner", label: "TUNER" },
        ].map((m) => (
          <button key={m.id} onClick={() => setMode(m.id)} className={`mode-tab ${mode === m.id ? "mode-tab-active" : ""}`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="input-area">
        {mode === "tuner" ? (
          <TunerPanel />
        ) : mode === "chords" ? (
          <ChordLibrary />
        ) : mode === "upload" ? (
          <div>
            {!apiKey && (
              <div className="api-key-bar">
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Anthropic API key (for screenshot analysis)" className="api-key-input" />
                <p className="api-key-hint">Required for AI screenshot reading. Get one at <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">console.anthropic.com</a> or set VITE_ANTHROPIC_API_KEY in .env</p>
              </div>
            )}
            <UploadZone onImage={handleScreenshot} loading={loading} />
            {status && <div className="status-bar" style={{ color: statusColors[status.t], background: `${statusColors[status.t]}15`, borderColor: `${statusColors[status.t]}33` }}>{status.m}</div>}
            {extracted && (
              <div style={{ marginTop: 10 }}>
                <span className="section-label">AI EXTRACTED — EDITABLE</span>
                <textarea value={tabText} onChange={(e) => setTabText(e.target.value)} className="tab-textarea" />
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="paste-actions">
              <button className="sample-btn" onClick={() => setTabText(SAMPLE_TAB)}>Load chords sample</button>
              <button className="sample-btn" onClick={() => setTabText(SAMPLE_TECHNIQUES)}>Load techniques sample</button>
            </div>
            <textarea value={tabText} onChange={(e) => setTabText(e.target.value)} placeholder={"Paste guitar tabs here...\n\ne|---0---2h4---|\nB|---1---3-----|\nG|---0---2b4---|\nD|---2---0-----|\nA|---3---0-----|\nE|---0---0-----|"} className="tab-textarea" style={{ minHeight: 180 }} />
            <p className="paste-hint">Supports: h (hammer-on) p (pull-off) / \\ (slides) b (bend) r (release) x (mute) ~ (vibrato) t (tap) &lt;n&gt; (harmonic) (n) (ghost note)</p>
          </div>
        )}
      </div>

      {/* Player: fretboard + controls (only for paste/upload modes) */}
      {showPlayer && (
        <>
          <div style={{ position: "relative", marginBottom: 14 }}>
            <Fretboard activeNotes={notes} chordName={chordName} techniques={uniqueTechniques} />
          </div>

          {steps.length > 0 && (
            <div className="step-info-wrap">
              <div className="step-info">
                <span className="step-label">STEP {cur + 1}/{steps.length}</span>
                {chordName && <span className="step-chord">{chordName}</span>}
                {notes.map((n, i) => (
                  <span key={i} className="step-note" style={{ color: FINGER_COLORS[n.finger] || "#D4AF37" }}>
                    {n.type === "mute" ? <span>X</span> : (
                      <>
                        {STRINGS[n.string].name}
                        <span className="step-note-num">({STRINGS[n.string].num})</span>
                        :{n.fret}
                        <span className="step-note-name">{getNoteName(n.string, n.fret)}</span>
                        {n.technique && <span className="step-technique" style={{ color: "#D4AF37" }}> {TECHNIQUE_INFO[n.technique]?.short || ""}</span>}
                      </>
                    )}
                  </span>
                ))}
              </div>
              {uniqueTechniques.length > 0 && (
                <div className="technique-desc">
                  {uniqueTechniques.map((t) => TECHNIQUE_INFO[t] && (
                    <span key={t} className="technique-hint"><strong>{TECHNIQUE_INFO[t].label}</strong>: {TECHNIQUE_INFO[t].desc}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="progress-wrap">
            <div className="progress-track" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setCur(Math.max(0, Math.min(steps.length - 1, Math.floor(((e.clientX - r.left) / r.width) * steps.length)))); }}>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="progress-labels">
              <span>{cur + 1} / {steps.length || 0}</span>
              <span>{baseSpeed}ms base</span>
            </div>
          </div>

          <div className="controls">
            <button onClick={() => setCur((p) => Math.max(0, p - 1))} className="ctrl-btn">&#x23EE;</button>
            <button onClick={() => { if (cur >= steps.length - 1) setCur(0); setPlaying(!playing); }} className={`ctrl-btn ctrl-play ${playing ? "ctrl-stop" : ""}`}>{playing ? "\u23F8" : "\u25B6"}</button>
            <button onClick={() => setCur((p) => Math.min(steps.length - 1, p + 1))} className="ctrl-btn">&#x23ED;</button>
            <button onClick={() => { setCur(0); setPlaying(false); }} className="ctrl-btn">&#x21BA;</button>
            <div style={{ width: 8 }} />
            {[{ l: "0.5x", v: 800 }, { l: "1x", v: 400 }, { l: "2x", v: 200 }, { l: "4x", v: 100 }].map((s) => (
              <button key={s.l} onClick={() => setBaseSpeed(s.v)} className={`ctrl-btn ctrl-speed ${baseSpeed === s.v ? "ctrl-speed-active" : ""}`}>{s.l}</button>
            ))}
          </div>

          <div className="legend">
            {[{ f: 0, l: "Open" }, { f: 1, l: "Index" }, { f: 2, l: "Middle" }, { f: 3, l: "Ring" }, { f: 4, l: "Pinky" }].map(({ f, l }) => (
              <div key={f} className="legend-item">
                <div className="legend-dot" style={{ background: f === 0 ? "transparent" : FINGER_COLORS[f], border: f === 0 ? `2px solid ${FINGER_COLORS[1]}` : "none", color: f === 0 ? FINGER_COLORS[1] : "#1A0604" }}>
                  {f === 0 ? "\u25CB" : f}
                </div>
                {l}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}