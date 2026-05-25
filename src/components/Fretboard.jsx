import { STRINGS, STRING_COLORS, STRING_WIDTHS, FINGER_COLORS, FINGER_LABELS, TECHNIQUE_COLORS, getNoteName } from "../lib/music";
import { TECHNIQUE_INFO } from "../lib/parser";

const FRETS = 15;

export default function Fretboard({ activeNotes, chordName, techniques }) {
  const W = 720, H = 210, nut = 60, end = W - 20, top = 30, bot = H - 30;
  const sp = (bot - top) / 5;

  const fx = (f) => {
    if (f === 0) return nut - 15;
    const s = 1 - Math.pow(0.9439, f), t = 1 - Math.pow(0.9439, FRETS);
    return nut + (s / t) * (end - nut);
  };
  const sy = (s) => top + s * sp;
  const dots = [3, 5, 7, 9, 12, 15];

  // Collect active techniques for display
  const activeTechniques = activeNotes
    .filter((n) => n.technique)
    .map((n) => ({ string: n.string, technique: n.technique }));

  return (
    <div className="fretboard-perspective">
      <div className="fretboard-3d" style={{ width: W }}>
        {/* Chord name */}
        {chordName && <div className="chord-label">{chordName}</div>}

        {/* Technique badges */}
        {activeTechniques.length > 0 && (
          <div className="technique-badges">
            {activeTechniques.map((t, i) => {
              const info = TECHNIQUE_INFO[t.technique];
              if (!info) return null;
              return (
                <span key={i} className="technique-badge" style={{ borderColor: TECHNIQUE_COLORS[t.technique] || "#D4AF37", color: TECHNIQUE_COLORS[t.technique] || "#D4AF37" }}>
                  {info.short} {info.label} — {STRINGS[t.string].name} string
                </span>
              );
            })}
          </div>
        )}

        <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="fretboard-svg">
          <defs>
            <linearGradient id="fbG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3E2723" />
              <stop offset="50%" stopColor="#4E342E" />
              <stop offset="100%" stopColor="#3E2723" />
            </linearGradient>
            <linearGradient id="nG" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#E0D8C8" />
              <stop offset="50%" stopColor="#FFF8E7" />
              <stop offset="100%" stopColor="#E0D8C8" />
            </linearGradient>
            <filter id="gl">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="fg">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="dG">
              <stop offset="0%" stopColor="#8D6E63" />
              <stop offset="100%" stopColor="#5D4037" />
            </radialGradient>
          </defs>

          {/* Fretboard wood */}
          <rect x={nut} y={top - 12} width={end - nut} height={bot - top + 24} rx={3} fill="url(#fbG)" />
          {[...Array(8)].map((_, i) => (
            <line key={`gr-${i}`} x1={nut} y1={top - 10 + i * 25 + Math.sin(i) * 5} x2={end} y2={top - 10 + i * 25 + Math.cos(i) * 3} stroke="rgba(0,0,0,0.08)" strokeWidth={0.5} />
          ))}

          {/* Fret dots (trapezoid inlays for Les Paul feel) */}
          {dots.map((f) => {
            const x1 = fx(f - 1), x2 = fx(f), cx = (x1 + x2) / 2, my = (top + bot) / 2;
            const hw = Math.min((x2 - x1) * 0.3, 12);
            const hh = 8;
            if (f === 12) {
              return (
                <g key={f}>
                  <rect x={cx - hw} y={my - 22} width={hw * 2} height={hh} rx={1} fill="url(#dG)" opacity={0.6} />
                  <rect x={cx - hw} y={my + 14} width={hw * 2} height={hh} rx={1} fill="url(#dG)" opacity={0.6} />
                </g>
              );
            }
            return <rect key={f} x={cx - hw} y={my - hh / 2} width={hw * 2} height={hh} rx={1} fill="url(#dG)" opacity={0.5} />;
          })}

          {/* Nut */}
          <rect x={nut - 3} y={top - 10} width={6} height={bot - top + 20} rx={2} fill="url(#nG)" />

          {/* Fret wires */}
          {[...Array(FRETS)].map((_, i) => (
            <line key={`fw-${i}`} x1={fx(i + 1)} y1={top - 10} x2={fx(i + 1)} y2={bot + 10} stroke="#C0C0C0" strokeWidth={i < 5 ? 2.5 : 2} opacity={0.7} />
          ))}

          {/* Fret numbers */}
          {[1, 3, 5, 7, 9, 12, 15].map((f) => (
            <text key={`fn-${f}`} x={(fx(f - 1) + fx(f)) / 2} y={bot + 24} textAnchor="middle" fill="#6B5940" fontSize={9} fontFamily="monospace">{f}</text>
          ))}

          {/* Strings */}
          {[...Array(6)].map((_, s) => {
            const y = sy(s);
            const act = activeNotes.some((n) => n.string === s);
            return (
              <g key={`s-${s}`}>
                <line x1={nut} y1={y} x2={end} y2={y} stroke={STRING_COLORS[s]} strokeWidth={STRING_WIDTHS[s]} opacity={act ? 1 : 0.5} />
                {act && <line x1={nut} y1={y} x2={end} y2={y} stroke={STRING_COLORS[s]} strokeWidth={STRING_WIDTHS[s] + 2} opacity={0.15} filter="url(#gl)" />}
                {/* String label: name + number */}
                <text x={nut - 16} y={y + 4} textAnchor="end" fill={act ? "#D4C5A9" : "#6B5940"} fontSize={11} fontFamily="monospace" fontWeight="bold">{STRINGS[s].name}</text>
                <text x={nut - 19} y={y - 6} textAnchor="end" fill="#4A3828" fontSize={7} fontFamily="monospace">{STRINGS[s].num}</text>
              </g>
            );
          })}

          {/* Active notes */}
          {activeNotes.map((n, i) => {
            if (n.fret < 0 || n.type === "mute") {
              // Muted note — show X
              const y = sy(n.string);
              return (
                <g key={`m-${i}`}>
                  <text x={nut - 15} y={y + 5} textAnchor="middle" fill="#6B5940" fontSize={14} fontFamily="monospace" fontWeight="bold">X</text>
                </g>
              );
            }

            const x = n.fret === 0 ? nut - 15 : (fx(n.fret - 1) + fx(n.fret)) / 2;
            const y = sy(n.string);
            const baseColor = n.technique ? (TECHNIQUE_COLORS[n.technique] || FINGER_COLORS[n.finger]) : (FINGER_COLORS[n.finger] || "#D4AF37");
            const noteName = getNoteName(n.string, n.fret);

            // Harmonic — diamond shape
            if (n.type === "harmonic") {
              return (
                <g key={`h-${i}`} filter="url(#fg)">
                  <polygon points={`${x},${y - 10} ${x + 8},${y} ${x},${y + 10} ${x - 8},${y}`} fill="rgba(237,220,177,0.3)" stroke="#EDDCB1" strokeWidth={1.5} />
                  <text x={x} y={y + 4} textAnchor="middle" fill="#EDDCB1" fontSize={9} fontFamily="monospace" fontWeight="bold">{n.fret}</text>
                  <text x={x} y={y - 14} textAnchor="middle" fill="#EDDCB1" fontSize={7} fontFamily="monospace">NH</text>
                </g>
              );
            }

            // Ghost note — faded
            if (n.type === "ghost") {
              return (
                <g key={`g-${i}`} opacity={0.4}>
                  <circle cx={x} cy={y} r={8} fill="transparent" stroke={baseColor} strokeWidth={1.5} strokeDasharray="3,2" />
                  <text x={x} y={y + 4} textAnchor="middle" fill={baseColor} fontSize={10} fontFamily="monospace">{n.fret}</text>
                </g>
              );
            }

            // Normal / technique note
            return (
              <g key={`n-${i}`} filter="url(#fg)">
                {/* Glow */}
                <circle cx={x} cy={y} r={12} fill={baseColor} opacity={0.2} />
                {/* Dot */}
                <circle cx={x} cy={y} r={n.fret === 0 ? 7 : 9} fill={n.fret === 0 ? "transparent" : baseColor} stroke={baseColor} strokeWidth={n.fret === 0 ? 2 : 0}>
                  <animate attributeName="r" from={n.fret === 0 ? 5 : 6} to={n.fret === 0 ? 7 : 9} dur="0.2s" fill="freeze" />
                </circle>
                {/* Finger number */}
                <text x={x} y={y + 4} textAnchor="middle" fill={n.fret === 0 ? baseColor : "#1A0604"} fontSize={n.fret === 0 ? 12 : 11} fontFamily="monospace" fontWeight="bold">
                  {FINGER_LABELS[n.finger]}
                </text>
                {/* Note name above */}
                <text x={x} y={y - 13} textAnchor="middle" fill={baseColor} fontSize={8} fontFamily="monospace" fontWeight="bold" opacity={0.85}>{noteName}</text>
                {/* Technique marker below */}
                {n.technique && TECHNIQUE_INFO[n.technique] && (
                  <text x={x} y={y + 18} textAnchor="middle" fill={TECHNIQUE_COLORS[n.technique] || baseColor} fontSize={7} fontFamily="monospace" fontWeight="bold" opacity={0.9}>
                    {TECHNIQUE_INFO[n.technique].short}
                  </text>
                )}
                {/* Vibrato indicator */}
                {n.vibrato && (
                  <text x={x + 14} y={y + 3} fill={baseColor} fontSize={10} fontFamily="monospace" opacity={0.7}>~</text>
                )}
              </g>
            );
          })}
        </svg>

      </div>
    </div>
  );
}