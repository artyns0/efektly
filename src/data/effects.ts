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
    {
      id: makeId("reflectionGrid"),
      type: "reflectionGrid",
      name: EFFECT_LABELS.reflectionGrid,
      enabled: false,
      status: "ui-ready",
      settings: {
        preset: "soft-mirror",
        cellSize: 45,
        repeatCount: 3,
        mirrorAmount: 100,
        rotation: 0,
        scale: 1,
        softness: 12,
        glow: 25,
        contrast: 10,
        colorShift: 0,
        noise: 8,
        centerX: 0.5,
        centerY: 0.5,
        invert: false,
        colorMode: "original",
      },
    },
    {
      id: makeId("verticalEcho"),
      type: "verticalEcho",
      name: EFFECT_LABELS.verticalEcho,
      enabled: false,
      status: "ui-ready",
      settings: {
        preset: "clean-echo",
        direction: "down",
        echoLength: 35,
        repeatCount: 10,
        opacityFade: 70,
        stretchAmount: 12,
        blur: 8,
        threshold: 20,
        contrast: 15,
        noise: 5,
        offsetJitter: 0,
        backgroundFade: 0,
        invert: false,
        colorMode: "original",
        fgColor: "#F3F0E8",
        bgColor: "#131313",
        accentColor: "#FF5A1F",
      },
    },
  ];
}
