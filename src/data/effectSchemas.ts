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
