# Effects Batch Plan (Mondniles-inspired)

Six effects added/fixed inside Efektly's existing effect-stack architecture. No
framework changes; effects register through the normal path (type union →
settings → default instance → label/icon → renderer + `applyEffect` case →
`EFFECT_SCHEMAS` controls with a `preset` select). Preview and export share
`renderFrame`/`applyEffect`, so a correctly-written effect matches automatically.

## Architecture notes

- **Spatial params** are normalized with `fxScale()` (1080px reference) so
  preview and full-res export match — see `fxUtils.ts`.
- **Temporal effects** (Motion Trails, Slit Scan) need frame history. Added:
  - `temporalContext.ts` — a module-level per-render context
    (`{ mediaTimeMs, resetToken, playing }`) set by `PreviewCanvas` (video loop)
    and by the video exporter before each frame. Avoids changing `applyEffect`'s
    signature or all 16 effect calls.
  - `frameHistory.ts` — a per-effect-id ring buffer of **downsampled**
    offscreen canvases (bounded frame count + long-edge cap → bounded memory).
    Auto-resets on `resetToken` change or a media-time discontinuity (seek /
    loop / new media). `resetAllHistory()` is wired into media load/clear, the
    video `seeked`/`ended` events, and export start. Buffers are cleared on
    reset; GPU/canvas resources are plain 2D canvases (GC'd), and history is
    dropped when media changes.
- **Video-only effects** (Motion Trails, Slit Scan) render a "Video only"
  notice over an image source instead of processing it.
- **Inverse Strobe safety**: starts disabled; enabling shows a photosensitive
  warning that must be acknowledged before rapid animation runs; default preset
  is slow; warning text never reaches the export output.

## Tasks

### Stage 0 — Inspect & infra
- [x] Inspect rendering / pipeline / export / state / controls architecture
- [x] Diagnose current Neon Edge issues
- [x] Design temporal frame-history infra (`temporalContext`, `frameHistory`)
- [x] Create this plan doc

### Stage 1 — Neon Edge (fix)
- [x] Luminance → Sobel gradient edges
- [x] Sensitivity/threshold, smooth threshold (reduce crawl/flicker)
- [x] Thickness via controlled dilation
- [x] Multi-pass glow, brightness, single color, Black/Original background
- [x] Controls: Sensitivity, Thickness, Glow, Brightness, Color, Background, Reset
- [x] Presets: Cyan, White, Red, Gold
- [x] Image + video, preview == export

### Stage 2 — LED Scan
- [x] Reuse edge detection, dot-matrix / LED grid, edge+LED glow only
- [x] Grid scales with media resolution, zoom-independent
- [x] Controls: Sensitivity, LED Size, Glow, Brightness, Color Mode, Grid Opacity, Reset
- [x] Presets: Stadium Cyan, Magenta Pulse, White Matrix, RGB Stage

### Stage 3 — Night Vision
- [x] Green/Amber, gain, contrast/crush, sensor noise, scanlines, vignette, phosphor glow
- [x] Deterministic noise for export
- [x] Controls + presets (Military NVG, Security Amber, Clean Tactical, Dirty Sensor)

### Stage 4 — Inverse Strobe
- [x] 4-phase cycle (BW / flash / negative / flash)
- [x] Disabled by default + photosensitive warning gate + slow default
- [x] Controls: Speed, Threshold, Flash Intensity, Effect Mix, Phase Offset, Reset
- [x] Presets: Slow Pulse, Hard Inverse, Club Flash, Negative Beat

### Stage 5 — Motion Trails (video-only, temporal)
- [x] Motion-mask ghost trails via frame history, clean static background
- [x] History reset on seek/loop/new media, bounded memory
- [x] Controls: Trail Length, Fade, Motion Threshold, Blend Mode, Tint, Echo Mode, Echo Spacing, Reset
- [x] Presets: Ghost, Long Exposure, Cyan Echo, Magenta Echo, Hard Stutter

### Stage 6 — Slit Scan (video-only, temporal)
- [x] Per-strip read from different history frames; Horizontal/Vertical/Radial
- [x] Center/time-depth/buffer/speed/reverse; bounded + downsampled history
- [x] Reset on seek/loop/new media
- [x] Presets: Classic Horizontal, Vertical Melt, Radial Time Warp, Deep Stretch

### Stage 7 — Integration & regression
- [ ] Add/enable/disable/reorder, stacking with existing effects
- [ ] Media load, video transport, zoom, exports (Original/Square/Vertical), capture/record
- [ ] Build + lint

### Stage 8 — Browser test & preview
- [ ] Drive six effects in Chrome, check console, screenshots
- [ ] Final build/lint + commit
