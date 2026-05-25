import { useState, useMemo } from "react";
import { CATEGORIES, CHORDS } from "../lib/chordLibrary";
import { STRINGS, FINGER_COLORS, getNoteName } from "../lib/music";
import Fretboard from "./Fretboard";

// Convert chord data to the notes format Fretboard expects
function chordToNotes(chord) {
  const notes = [];
  for (let i = 0; i < 6; i++) {
    const fret = chord.frets[i];
    const finger = chord.fingers[i];
    if (fret === null) continue; // muted string, skip
    notes.push({
      string: i,
      fret,
      finger: finger || 0,
      type: "note",
      technique: null,
      vibrato: false,
    });
  }
  return notes;
}

function ChordCard({ chord, isSelected, onSelect }) {
  // Build a quick visual hint — fret numbers across strings
  const fretHint = chord.frets
    .map((f, i) => (f === null ? "x" : f === 0 ? "o" : f))
    .join(" ");

  return (
    <button
      onClick={onSelect}
      className={`chord-card ${isSelected ? "chord-card-selected" : ""}`}
    >
      <span className="chord-card-name">{chord.name}</span>
      <span className="chord-card-frets">{fretHint}</span>
      <span className="chord-card-context">{chord.context}</span>
    </button>
  );
}

export default function ChordLibrary() {
  const [activeCategory, setActiveCategory] = useState("blues");
  const [selectedIdx, setSelectedIdx] = useState(0);

  const category = CATEGORIES.find((c) => c.id === activeCategory);
  const chords = useMemo(() => CHORDS.filter((c) => c.category === activeCategory), [activeCategory]);
  const selected = chords[selectedIdx] || chords[0];
  const notes = selected ? chordToNotes(selected) : [];

  // Detect muted strings for display
  const mutedStrings = selected
    ? selected.frets.map((f, i) => (f === null ? i : -1)).filter((i) => i >= 0)
    : [];

  return (
    <div>
      {/* Category tabs */}
      <div className="chord-categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setSelectedIdx(0); }}
            className={`chord-cat-tab ${activeCategory === cat.id ? "chord-cat-active" : ""}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Category description */}
      {category && <p className="chord-cat-desc">{category.desc}</p>}

      {/* Fretboard showing selected chord */}
      {selected && (
        <div style={{ marginBottom: 12 }}>
          <Fretboard activeNotes={notes} chordName={selected.name} />
          {/* Muted string callout */}
          {mutedStrings.length > 0 && (
            <div className="chord-muted-info">
              Don't strum: {mutedStrings.map((s) => `${STRINGS[s].name} (${STRINGS[s].num})`).join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Chord description */}
      {selected && (
        <div className="chord-detail-panel">
          <p className="chord-detail-desc">{selected.desc}</p>
          {selected.basedOn && (
            <p className="chord-detail-based">{selected.basedOn}</p>
          )}
          <div className="chord-detail-notes">
            {selected.frets.map((fret, i) => {
              if (fret === null) return null;
              const finger = selected.fingers[i];
              return (
                <span key={i} className="chord-detail-note" style={{ color: FINGER_COLORS[finger] || "#D4C5A9" }}>
                  {STRINGS[i].num} {STRINGS[i].name}: {fret === 0 ? "open" : `fret ${fret}`} = {getNoteName(i, fret)}
                  {finger > 0 && ` (finger ${finger})`}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Chord picker grid */}
      <div className="chord-grid">
        {chords.map((chord, idx) => (
          <ChordCard
            key={chord.name}
            chord={chord}
            isSelected={selectedIdx === idx}
            onSelect={() => setSelectedIdx(idx)}
          />
        ))}
      </div>

      {/* Finger legend */}
      <div className="chord-legend">
        {[
          { f: 0, l: "Open" },
          { f: 1, l: "Index" },
          { f: 2, l: "Middle" },
          { f: 3, l: "Ring" },
          { f: 4, l: "Pinky" },
        ].map(({ f, l }) => (
          <div key={f} className="chord-legend-item">
            <div className="chord-legend-dot" style={{
              background: f === 0 ? "transparent" : FINGER_COLORS[f],
              border: f === 0 ? "2px solid #D4AF37" : "none",
              color: f === 0 ? "#D4AF37" : "#1A0604",
            }}>
              {f === 0 ? "\u25CB" : f}
            </div>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}