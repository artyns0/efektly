# Efektly

**Upload. Stylize. Export.** — a local-first, browser-based real-time visual effects lab.

This is **Step 1: the UI shell and navigation foundation**. It renders the full
interface (top bar, side nav, control panel, dominant live-preview workspace) and
wires up navigation state between Media / Shader / Export / Settings. No real media
processing, shaders, animation engine, or export pipeline yet — those land in later steps.

## Stack
React · Vite · TypeScript · Tailwind CSS v4 · Zustand · lucide-react

## Run locally
```bash
npm install
npm run dev      # http://localhost:5173
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
    layout/    AppShell, TopBar, SideNav, ControlPanel, PreviewWorkspace, Logo
    panels/    MediaPanel, ShaderPanel, ExportPanel, SettingsPanel
    controls/  Button, SegmentedControl, SliderControl, SelectControl,
               ColorSwatches, Toggle, Section
    preview/   PreviewPlaceholder (Canvas 2D dot-dune visual)
  store/       useAppStore (Zustand)
  types/       app.ts
  data/        mockData.ts
  lib/         cn.ts
```

## Notes
- Clicking the top-right **Export** button switches the left panel to Export mode.
- The side-nav rail has exactly 4 modes; Settings is pinned to the bottom.
- The preview visual is a decorative Canvas placeholder, replaced by the real
  effect/shader engine in a later step. It respects `prefers-reduced-motion`.
