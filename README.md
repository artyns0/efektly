# Efektly

**Upload. Stylize. Export.** — a local-first, browser-based real-time visual effects lab.

The app is a motion-design-style workspace: top toolbar with **Source / Effects /
Shader / 3D** navigation, left content panel, large live preview with timeline
transport, and a right **Properties / Export** panel.

- **Source** — upload images (PNG/JPG/WebP) or short videos (MP4/WebM).
- **Effects** — a stack of real-time Canvas 2D media effects (Dither, ASCII,
  Glitch, Line Art, Grain, Crosshatch, Pixel Sort, CRT, VHS, Kaleidoscope,
  Neon Edge, Vision Tracker, …) with per-effect controls in Properties.
- **Shader** — procedural Canvas 2D visuals (Liquid Glass, Plasma Gradient,
  Kinetic Lines, Aura Orb, Spark Burst, …) with presets, no media required.
- **3D** — real-time Three.js viewport (Particle Forms 3D, Elastic Bubble 3D)
  with orbit/zoom controls.
- **Capture / Record / Export** — grab stills, record WebM clips, export
  PNG/JPG/WebP at selectable resolutions.

## Stack
React · Vite · TypeScript · Tailwind CSS v4 · Zustand · Three.js · lucide-react

## Run locally
```bash
npm install
npm run dev      # then open http://localhost:5173/
```
Other scripts: `npm run build`, `npm run preview`.

## Brand
- Onyx `#131313` — dark base
- Soft Linen `#F3F0E8` — warm neutral surface/text
- Tiger Flame `#FF5A1F` — accent for active states, sliders, CTAs

## Structure
```
src/
  components/
    playground/  PlaygroundShell (main app shell), toolbar, panels, timeline
    panels/      ExportPanel, SettingsPanel, shader + 3D property panels
    controls/    Button, SegmentedControl, SliderControl, SelectControl, …
    preview/     PreviewStage, PreviewCanvas, ShaderCanvas, zoom hook
    media/       MediaSource (upload), video transport
    three/       ThreeViewport (Three.js host)
  engine/
    pipeline.ts  media-effect dispatcher
    effects/     Canvas 2D media effect renderers
    shaders/     procedural shader renderers
    three/       3D object engines
    export/      image/video export helpers
  store/         useAppStore (Zustand)
  types/  data/  domain types + catalogues/defaults
```
