import type { EffectInstance, EffectStatus, EffectType } from "../types/effects";

/* ------------------------------------------------------------------ */
/*  Effect catalogue + initial stack.                                  */
/*  All five categories ship as UI-ready placeholders: their controls  */
/*  are live and update state, but none process the canvas yet.        */
/* ------------------------------------------------------------------ */

export const EFFECT_LABELS: Record<EffectType, string> = {
  dither: "Dither",
  ascii: "ASCII",
  glitch: "Glitch",
  lineArt: "Line Art",
  grain: "Grain",
  reflectionGrid: "Reflection Grid",
  verticalEcho: "Vertical Echo",
};

/** Subtle copy for the status chip. */
export const STATUS_LABELS: Record<EffectStatus, string> = {
  "ui-ready": "UI Ready",
  "controls-ready": "Controls ready",
  "coming-next": "Coming next",
};

let seq = 0;
const makeId = (type: EffectType) => `${type}-${++seq}`;

export function createInitialEffects(): EffectInstance[] {
  return [
    {
      id: makeId("dither"),
      type: "dither",
      name: EFFECT_LABELS.dither,
      enabled: false,
      status: "ui-ready",
      settings: {
        preset: "floyd-steinberg",
        pointSize: 2,
        threshold: 50,
        contrast: 0,
        palette: ["#131313", "#F3F0E8"],
        invert: false,
        bloom: false,
      },
    },
    {
      id: makeId("ascii"),
      type: "ascii",
      name: EFFECT_LABELS.ascii,
      enabled: false,
      status: "ui-ready",
      settings: {
        preset: "standard",
        cellSize: 8,
        charSet: "standard",
        invert: false,
        colorMode: "mono",
        rotation: false,
        fgColor: "#F3F0E8",
        bgColor: "#131313",
      },
    },
    {
      id: makeId("glitch"),
      type: "glitch",
      name: EFFECT_LABELS.glitch,
      enabled: false,
      status: "ui-ready",
      settings: {
        preset: "vhs",
        rgbShift: 25,
        scanlines: 45,
        distortion: 14,
        noise: 15,
        glitches: 18,
        grain: 15,
        animation: true,
      },
    },
    {
      id: makeId("lineArt"),
      type: "lineArt",
      name: EFFECT_LABELS.lineArt,
      enabled: false,
      status: "ui-ready",
      settings: {
        preset: "clean",
        threshold: 45,
        thickness: 2,
        softness: 12,
        fill: 0,
        lineWeight: 1.2,
        wave: 0,
        waveFrequency: 6,
        invert: false,
        lineColor: "#131313",
        fillColor: "#FF5A1F",
        bgColor: "#F3F0E8",
      },
    },
    {
      id: makeId("grain"),
      type: "grain",
      name: EFFECT_LABELS.grain,
      enabled: false,
      status: "ui-ready",
      settings: {
        amount: 30,
        size: 1,
        speed: 1,
        monochrome: true,
        blendMode: "overlay",
      },
    },
    // Reflection Grid + Vertical Echo removed from the visible stack for now.
    // Their engine + control files remain in the repo, unused, for later.
  ];
}
