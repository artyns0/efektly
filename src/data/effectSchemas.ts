import type { EffectType } from "../types/effects";

/* ------------------------------------------------------------------ */
/*  Declarative control schemas for the v2 effect pack. Rendered by    */
/*  GenericEffectControls — keeps 8 new effects from needing 8 files.  */
/* ------------------------------------------------------------------ */

export type FieldDef =
  | { kind: "slider"; key: string; label: string; min: number; max: number; step?: number; unit?: string }
  | { kind: "select"; key: string; label: string; options: { value: string; label: string }[]; patches?: Record<string, Record<string, number | string | boolean>> }
  | { kind: "toggle"; key: string; label: string }
  | { kind: "color"; key: string; label: string };

const pct = (key: string, label: string): FieldDef => ({
  kind: "slider", key, label, min: 0, max: 100, step: 1, unit: "%",
});

export const EFFECT_SCHEMAS: Partial<Record<EffectType, FieldDef[]>> = {
  crosshatch: [
    {
      kind: "select", key: "preset", label: "Preset",
      options: [
        { value: "clean-hatch", label: "Clean Hatch" },
        { value: "sketch", label: "Sketch" },
        { value: "engrave", label: "Engrave" },
        { value: "technical", label: "Technical" },
        { value: "comic-ink", label: "Comic Ink" },
      ],
      patches: {
        "clean-hatch": { lineDensity: 55, lineWidth: 1, roughness: 20, jitter: 10, threshold: 65 },
        sketch: { lineDensity: 60, lineWidth: 1, roughness: 70, jitter: 45, threshold: 70 },
        engrave: { lineDensity: 80, lineWidth: 1.5, roughness: 10, jitter: 5, threshold: 75 },
        technical: { lineDensity: 45, lineWidth: 0.8, roughness: 0, jitter: 0, threshold: 55 },
        "comic-ink": { lineDensity: 65, lineWidth: 2.2, roughness: 35, jitter: 20, threshold: 60 },
      },
    },
    pct("lineDensity", "Line Density"),
    { kind: "slider", key: "lineWidth", label: "Line Width", min: 0.5, max: 4, step: 0.1, unit: "px" },
    { kind: "slider", key: "angle1", label: "Angle 1", min: 0, max: 180, step: 1, unit: "°" },
    { kind: "slider", key: "angle2", label: "Angle 2", min: 0, max: 180, step: 1, unit: "°" },
    pct("threshold", "Threshold"),
    { kind: "slider", key: "contrast", label: "Contrast", min: -100, max: 100, step: 1 },
    pct("roughness", "Roughness"),
    pct("jitter", "Jitter"),
    { kind: "color", key: "inkColor", label: "Ink Color" },
    { kind: "color", key: "bgColor", label: "Background" },
    { kind: "toggle", key: "invert", label: "Invert" },
  ],
  scanStretch: [
    {
      kind: "select", key: "direction", label: "Direction",
      options: [
        { value: "horizontal", label: "Horizontal" },
        { value: "vertical", label: "Vertical" },
      ],
    },
    { kind: "slider", key: "scanWidth", label: "Scan Width", min: 2, max: 80, step: 1, unit: "px" },
    pct("stretchAmount", "Stretch Amount"),
    pct("density", "Density"),
    pct("fade", "Fade"),
    pct("jitter", "Jitter"),
    pct("threshold", "Threshold"),
    { kind: "slider", key: "contrast", label: "Contrast", min: -100, max: 100, step: 1 },
    {
      kind: "select", key: "colorMode", label: "Color Mode",
      options: [
        { value: "original", label: "Original" },
        { value: "mono", label: "Mono" },
        { value: "brand", label: "Brand" },
      ],
    },
    { kind: "toggle", key: "invert", label: "Invert" },
  ],
  pixelSort: [
    {
      kind: "select", key: "direction", label: "Direction",
      options: [
        { value: "horizontal", label: "Horizontal" },
        { value: "vertical", label: "Vertical" },
      ],
    },
    pct("threshold", "Threshold"),
    pct("sortLength", "Sort Length"),
    pct("chaos", "Chaos"),
    pct("maskStrength", "Mask Strength"),
    pct("colorPreserve", "Color Preserve"),
    pct("blend", "Blend"),
    { kind: "toggle", key: "invert", label: "Invert" },
  ],
  lightTrails: [
    { kind: "slider", key: "angle", label: "Direction Angle", min: 0, max: 360, step: 1, unit: "°" },
    pct("trailLength", "Trail Length"),
    pct("threshold", "Threshold"),
    pct("glow", "Glow"),
    pct("decay", "Decay"),
    pct("blur", "Blur"),
    pct("intensity", "Intensity"),
    { kind: "color", key: "color", label: "Color" },
    {
      kind: "select", key: "blendMode", label: "Blend Mode",
      options: [
        { value: "screen", label: "Screen" },
        { value: "add", label: "Add" },
        { value: "soft-light", label: "Soft Light" },
      ],
    },
  ],
  crtMonitor: [
    pct("curvature", "Curvature"),
    pct("scanlines", "Scanlines"),
    pct("rgbMask", "RGB Mask"),
    pct("phosphorGlow", "Phosphor Glow"),
    pct("flicker", "Flicker"),
    pct("noise", "Noise"),
    pct("vignette", "Vignette"),
    { kind: "slider", key: "brightness", label: "Brightness", min: -80, max: 100, step: 1 },
    { kind: "slider", key: "contrast", label: "Contrast", min: -80, max: 100, step: 1 },
  ],
  vhsBleed: [
    pct("colorBleed", "Color Bleed"),
    pct("horizontalSmear", "Horizontal Smear"),
    pct("trackingNoise", "Tracking Noise"),
    pct("scanlines", "Scanlines"),
    pct("jitter", "Jitter"),
    pct("distortion", "Distortion"),
    pct("noise", "Noise"),
    { kind: "slider", key: "saturation", label: "Saturation", min: 0, max: 300, step: 5, unit: "%" },
    pct("timeDrift", "Time Drift"),
  ],
  kaleidoscope: [
    { kind: "slider", key: "segments", label: "Segments", min: 3, max: 24, step: 1 },
    { kind: "slider", key: "rotation", label: "Rotation", min: 0, max: 360, step: 1, unit: "°" },
    { kind: "slider", key: "scale", label: "Scale", min: 0.25, max: 4, step: 0.05, unit: "x" },
    pct("mirrorAmount", "Mirror Amount"),
    { kind: "slider", key: "centerX", label: "Center X", min: 0, max: 1, step: 0.01 },
    { kind: "slider", key: "centerY", label: "Center Y", min: 0, max: 1, step: 0.01 },
    pct("softness", "Softness"),
    pct("glow", "Glow"),
    { kind: "slider", key: "colorShift", label: "Color Shift", min: 0, max: 360, step: 1, unit: "°" },
    { kind: "color", key: "background", label: "Background" },
  ],
  neonEdge: [
    {
      kind: "select", key: "preset", label: "Preset",
      options: [
        { value: "Cyan", label: "Cyan" },
        { value: "White", label: "White" },
        { value: "Red", label: "Red" },
        { value: "Gold", label: "Gold" },
      ],
      patches: {
        Cyan: { color: "#38E1FF", sensitivity: 55, thickness: 30, glow: 60, brightness: 70 },
        White: { color: "#F4F7FF", sensitivity: 50, thickness: 25, glow: 45, brightness: 80 },
        Red: { color: "#FF4436", sensitivity: 58, thickness: 34, glow: 65, brightness: 68 },
        Gold: { color: "#FFC148", sensitivity: 52, thickness: 30, glow: 58, brightness: 74 },
      },
    },
    pct("sensitivity", "Sensitivity"),
    pct("thickness", "Thickness"),
    pct("glow", "Glow"),
    pct("brightness", "Brightness"),
    { kind: "color", key: "color", label: "Color" },
    {
      kind: "select", key: "background", label: "Background",
      options: [
        { value: "black", label: "Black" },
        { value: "original", label: "Original" },
      ],
    },
  ],
  ledScan: [
    {
      kind: "select", key: "preset", label: "Preset",
      options: [
        { value: "Stadium Cyan", label: "Stadium Cyan" },
        { value: "Magenta Pulse", label: "Magenta Pulse" },
        { value: "White Matrix", label: "White Matrix" },
        { value: "RGB Stage", label: "RGB Stage" },
      ],
      patches: {
        "Stadium Cyan": { colorMode: "cyan", ledSize: 30, glow: 55, brightness: 70, gridOpacity: 40, sensitivity: 55 },
        "Magenta Pulse": { colorMode: "magenta", ledSize: 34, glow: 65, brightness: 72, gridOpacity: 45, sensitivity: 55 },
        "White Matrix": { colorMode: "white", ledSize: 22, glow: 45, brightness: 82, gridOpacity: 55, sensitivity: 60 },
        "RGB Stage": { colorMode: "rgb", ledSize: 30, glow: 50, brightness: 70, gridOpacity: 35, sensitivity: 50 },
      },
    },
    pct("sensitivity", "Sensitivity"),
    pct("ledSize", "LED Size"),
    pct("glow", "Glow"),
    pct("brightness", "Brightness"),
    {
      kind: "select", key: "colorMode", label: "Color Mode",
      options: [
        { value: "cyan", label: "Cyan" },
        { value: "magenta", label: "Magenta" },
        { value: "white", label: "White" },
        { value: "rgb", label: "RGB" },
      ],
    },
    pct("gridOpacity", "Grid Opacity"),
  ],
  nightVision: [
    {
      kind: "select", key: "preset", label: "Preset",
      options: [
        { value: "Military NVG", label: "Military NVG" },
        { value: "Security Amber", label: "Security Amber" },
        { value: "Clean Tactical", label: "Clean Tactical" },
        { value: "Dirty Sensor", label: "Dirty Sensor" },
      ],
      patches: {
        "Military NVG": { colorMode: "green", gain: 60, contrast: 55, noise: 25, scanlineDensity: 50, scanlineIntensity: 35, vignette: 55, glow: 40 },
        "Security Amber": { colorMode: "amber", gain: 55, contrast: 50, noise: 30, scanlineDensity: 60, scanlineIntensity: 45, vignette: 60, glow: 35 },
        "Clean Tactical": { colorMode: "green", gain: 65, contrast: 60, noise: 8, scanlineDensity: 30, scanlineIntensity: 20, vignette: 40, glow: 30 },
        "Dirty Sensor": { colorMode: "green", gain: 70, contrast: 65, noise: 65, scanlineDensity: 70, scanlineIntensity: 55, vignette: 70, glow: 50 },
      },
    },
    {
      kind: "select", key: "colorMode", label: "Color Mode",
      options: [
        { value: "green", label: "Green" },
        { value: "amber", label: "Amber" },
      ],
    },
    pct("gain", "Gain"),
    pct("contrast", "Contrast"),
    pct("noise", "Noise"),
    pct("scanlineDensity", "Scanline Density"),
    pct("scanlineIntensity", "Scanline Intensity"),
    pct("vignette", "Vignette"),
    pct("glow", "Glow"),
  ],
  inverseStrobe: [
    {
      kind: "select", key: "preset", label: "Preset",
      options: [
        { value: "Slow Pulse", label: "Slow Pulse" },
        { value: "Hard Inverse", label: "Hard Inverse" },
        { value: "Club Flash", label: "Club Flash" },
        { value: "Negative Beat", label: "Negative Beat" },
      ],
      patches: {
        "Slow Pulse": { speed: 20, threshold: 50, flashIntensity: 55, effectMix: 100, phaseOffset: 0 },
        "Hard Inverse": { speed: 40, threshold: 45, flashIntensity: 70, effectMix: 100, phaseOffset: 0 },
        "Club Flash": { speed: 70, threshold: 55, flashIntensity: 90, effectMix: 100, phaseOffset: 0 },
        "Negative Beat": { speed: 55, threshold: 48, flashIntensity: 75, effectMix: 100, phaseOffset: 25 },
      },
    },
    pct("speed", "Speed"),
    pct("threshold", "Threshold"),
    pct("flashIntensity", "Flash Intensity"),
    pct("effectMix", "Effect Mix"),
    pct("phaseOffset", "Phase Offset"),
  ],
  motionTrails: [
    {
      kind: "select", key: "preset", label: "Preset",
      options: [
        { value: "Ghost", label: "Ghost" },
        { value: "Long Exposure", label: "Long Exposure" },
        { value: "Cyan Echo", label: "Cyan Echo" },
        { value: "Magenta Echo", label: "Magenta Echo" },
        { value: "Hard Stutter", label: "Hard Stutter" },
      ],
      patches: {
        Ghost: { trailLength: 45, fade: 55, motionThreshold: 25, blendMode: "screen", tintAmount: 0, echoMode: "off", echoSpacing: 30 },
        "Long Exposure": { trailLength: 85, fade: 20, motionThreshold: 15, blendMode: "lighten", tintAmount: 0, echoMode: "off", echoSpacing: 30 },
        "Cyan Echo": { trailLength: 60, fade: 45, motionThreshold: 25, blendMode: "screen", tint: "#38E1FF", tintAmount: 60, echoMode: "multi", echoSpacing: 35 },
        "Magenta Echo": { trailLength: 60, fade: 45, motionThreshold: 25, blendMode: "screen", tint: "#FF3EC8", tintAmount: 60, echoMode: "multi", echoSpacing: 35 },
        "Hard Stutter": { trailLength: 40, fade: 65, motionThreshold: 30, blendMode: "add", tintAmount: 0, echoMode: "single", echoSpacing: 55 },
      },
    },
    pct("trailLength", "Trail Length"),
    pct("fade", "Fade"),
    pct("motionThreshold", "Motion Threshold"),
    {
      kind: "select", key: "blendMode", label: "Blend Mode",
      options: [
        { value: "screen", label: "Screen" },
        { value: "add", label: "Add" },
        { value: "lighten", label: "Lighten" },
        { value: "normal", label: "Normal" },
      ],
    },
    { kind: "color", key: "tint", label: "Tint" },
    pct("tintAmount", "Tint Amount"),
    {
      kind: "select", key: "echoMode", label: "Echo Mode",
      options: [
        { value: "off", label: "Off" },
        { value: "single", label: "Single" },
        { value: "multi", label: "Multi" },
      ],
    },
    pct("echoSpacing", "Echo Spacing"),
  ],
  slitScan: [
    {
      kind: "select", key: "preset", label: "Preset",
      options: [
        { value: "Classic Horizontal", label: "Classic Horizontal" },
        { value: "Vertical Melt", label: "Vertical Melt" },
        { value: "Radial Time Warp", label: "Radial Time Warp" },
        { value: "Deep Stretch", label: "Deep Stretch" },
      ],
      patches: {
        "Classic Horizontal": { direction: "horizontal", bufferLength: 50, speed: 50, center: 0.5, timeDepth: 60, reverse: false },
        "Vertical Melt": { direction: "vertical", bufferLength: 55, speed: 45, center: 0.5, timeDepth: 65, reverse: false },
        "Radial Time Warp": { direction: "radial", bufferLength: 60, speed: 55, center: 0, timeDepth: 70, reverse: false },
        "Deep Stretch": { direction: "horizontal", bufferLength: 90, speed: 70, center: 0.2, timeDepth: 90, reverse: false },
      },
    },
    {
      kind: "select", key: "direction", label: "Direction",
      options: [
        { value: "horizontal", label: "Horizontal" },
        { value: "vertical", label: "Vertical" },
        { value: "radial", label: "Radial" },
      ],
    },
    pct("bufferLength", "Buffer Length"),
    pct("speed", "Speed"),
    { kind: "slider", key: "center", label: "Center", min: 0, max: 1, step: 0.01 },
    pct("timeDepth", "Time Depth"),
    { kind: "toggle", key: "reverse", label: "Reverse" },
  ],
  opticalGlass: [
    {
      kind: "select", key: "preset", label: "Preset",
      options: [
        { value: "Ribbed Glass", label: "Ribbed Glass" },
        { value: "Glass Blocks", label: "Glass Blocks" },
        { value: "Slit Lens", label: "Slit Lens" },
        { value: "Soft Lens", label: "Soft Lens" },
      ],
      patches: {
        "Ribbed Glass": { mode: "ribbed", direction: "vertical", cells: 22, refraction: 58, curvature: 72, blur: 12, frost: 5, gap: 8, edgeLight: 38, chromaticAberration: 8 },
        "Glass Blocks": { mode: "blocks", direction: "vertical", cells: 9, refraction: 52, curvature: 68, blur: 18, frost: 12, gap: 12, edgeLight: 45, chromaticAberration: 4 },
        "Slit Lens": { mode: "slit", direction: "vertical", cells: 18, refraction: 82, curvature: 88, blur: 3, frost: 0, gap: 5, edgeLight: 24, chromaticAberration: 2 },
        "Soft Lens": { mode: "soft-lens", direction: "vertical", cells: 12, refraction: 48, curvature: 55, blur: 24, frost: 8, gap: 0, edgeLight: 32, chromaticAberration: 10 },
      },
    },
    {
      kind: "select", key: "mode", label: "Glass Type",
      options: [
        { value: "ribbed", label: "Ribbed" },
        { value: "blocks", label: "Glass Blocks" },
        { value: "slit", label: "Slit" },
        { value: "soft-lens", label: "Soft Lens" },
      ],
    },
    {
      kind: "select", key: "direction", label: "Direction",
      options: [
        { value: "vertical", label: "Vertical" },
        { value: "horizontal", label: "Horizontal" },
      ],
    },
    { kind: "slider", key: "cells", label: "Ribs / Cells", min: 2, max: 64, step: 1 },
    pct("refraction", "Refraction"),
    pct("curvature", "Lens Curvature"),
    pct("blur", "Glass Blur"),
    pct("frost", "Frost"),
    pct("gap", "Cell Gap"),
    pct("edgeLight", "Edge Light"),
    pct("chromaticAberration", "Color Dispersion"),
    pct("panelX", "Panel X"),
    pct("panelY", "Panel Y"),
    pct("panelWidth", "Panel Width"),
    pct("panelHeight", "Panel Height"),
    pct("feather", "Edge Feather"),
    pct("mix", "Effect Mix"),
  ],
  visionTracker: [
    /* detection */
    pct("threshold", "Threshold"),
    pct("blur", "Blur"),
    pct("contrast", "Contrast"),
    pct("minArea", "Min Area"),
    pct("maxArea", "Max Area"),
    pct("mergeDistance", "Merge Distance"),
    pct("sensitivity", "Sensitivity"),
    { kind: "toggle", key: "invert", label: "Invert" },
    { kind: "toggle", key: "backgroundDiff", label: "Background Difference" },
    { kind: "toggle", key: "motionDiff", label: "Motion Difference" },
    {
      kind: "select", key: "processingScale", label: "Processing Scale",
      options: [
        { value: "low", label: "Low (240px)" },
        { value: "medium", label: "Medium (360px)" },
        { value: "high", label: "High (480px)" },
      ],
    },
    /* tracking */
    { kind: "slider", key: "maxBlobs", label: "Max Blobs", min: 1, max: 120, step: 1 },
    pct("matchDistance", "Match Distance"),
    pct("persistence", "Persistence"),
    pct("smoothing", "Smoothing"),
    pct("idStability", "ID Stability"),
    pct("velocitySmoothing", "Velocity Smoothing"),
    /* overlay */
    {
      kind: "select", key: "shapeMode", label: "Shape Mode",
      options: [
        { value: "boxes", label: "Boxes" },
        { value: "lines", label: "Lines" },
        { value: "boxesLines", label: "Boxes + Lines" },
        { value: "dots", label: "Dots" },
        { value: "crosshair", label: "Crosshair" },
        { value: "cube", label: "Cube / Rect Grid" },
        { value: "hud", label: "Minimal HUD" },
        { value: "network", label: "Network" },
        { value: "dataLabels", label: "Data Labels" },
      ],
    },
    { kind: "toggle", key: "showBoxes", label: "Show Boxes" },
    { kind: "toggle", key: "showCenters", label: "Show Centers" },
    { kind: "toggle", key: "showIds", label: "Show IDs" },
    { kind: "toggle", key: "showArea", label: "Show Area Values" },
    { kind: "toggle", key: "showLines", label: "Show Lines" },
    { kind: "toggle", key: "showTrails", label: "Show Trails" },
    { kind: "toggle", key: "showNetwork", label: "Show Network" },
    pct("lineDistance", "Line Distance"),
    pct("trailLength", "Trail Length"),
    /* style */
    { kind: "color", key: "boxColor", label: "Box Color" },
    { kind: "color", key: "lineColor", label: "Line Color" },
    { kind: "color", key: "centerColor", label: "Center Color" },
    { kind: "color", key: "textColor", label: "Text Color" },
    pct("boxThickness", "Box Thickness"),
    pct("lineThickness", "Line Thickness"),
    pct("textSize", "Text Size"),
    pct("opacity", "Opacity"),
    pct("glow", "Glow"),
    /* background */
    {
      kind: "select", key: "background", label: "Background",
      options: [
        { value: "original", label: "Original Media" },
        { value: "grayscale", label: "Grayscale Media" },
        { value: "threshold", label: "Threshold Mask" },
        { value: "black", label: "Black Background" },
        { value: "difference", label: "Difference View" },
      ],
    },
  ],
};
