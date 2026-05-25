# Tabr

AI-powered guitar tab visualizer + built-in tuner. Free forever.

## Quick Start

```bash
cd tabr
npm install
npm run dev
```

Opens at http://localhost:3003

## Screenshot Feature (API Key)

The screenshot analysis uses the Anthropic API via a Vite dev proxy (no CORS issues).

```bash
# Option 1: .env file
echo "VITE_ANTHROPIC_API_KEY=sk-ant-your-key" > .env

# Option 2: enter in the UI when prompted
```

The proxy routes `/api/anthropic/*` through the dev server, so no browser CORS issues. Paste tab and tuner work without a key.

## What It Does

- Parses all standard tab notation: h p / \ b r x ~ t <n> (n)
- Shows technique-specific visuals on the fretboard (diamonds for harmonics, dashed for ghost notes, color-coded by technique type)
- Timing-aware playback from dash spacing in the tab
- Chord detection (25+ shapes) displayed above the fretboard
- Note names on every active position
- String numbering (1st through 6th) alongside note names
- Plain-English technique descriptions (what to physically do)
- Built-in chromatic tuner with autocorrelation pitch detection
- 3D POV rosewood fretboard with trapezoid inlays
- Cherry sunburst Les Paul theme

## Build

```bash
npm run build   # outputs to dist/
```
