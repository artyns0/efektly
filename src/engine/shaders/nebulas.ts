import type { NebulasSettings } from "../../types/shaders";
import { hexToRgb } from "./shaderUtils";

/* ------------------------------------------------------------------ */
/*  Nebulas — premium silky iridescent volumetric nebula.              */
/*                                                                     */
/*  The Efektly shader stage is a 2D canvas, so this renders a GPU      */
/*  fragment shader on a dedicated offscreen WebGL canvas (persistent    */
/*  singleton — no per-frame allocation or context churn) and blits the  */
/*  result onto the 2D preview.                                         */
/*                                                                     */
/*  Look: an iteratively domain-warped flow field produces smooth,      */
/*  ribbon-like light structures (no chunky fractal noise). The field   */
/*  is sampled three times with small per-channel phase offsets, which   */
/*  gives true prismatic spectral separation (the iridescent edges).    */
/*  A cosine palette + pastel lift + ridge highlights + soft radial      */
/*  depth fade complete the dreamy, layered volumetric feel.            */
/* ------------------------------------------------------------------ */

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform float uTime;
/* performance */
uniform float uIter, uLacunarity;
/* nebula */
uniform float uScale, uFlow, uWarp, uSwirl, uSoftness, uContrast;
uniform float uRadius, uDepthFade, uFogDensity, uGlow, uBrightness;
/* color phase */
uniform float uRP, uGP, uBP;
/* motion / composition */
uniform float uDrift, uRot, uCenterPull, uSpread;
/* look */
uniform float uSaturation, uHighlights, uBloom, uPrism, uBgMix, uBalance;
uniform vec3  uBg, uTintA, uTintB;

const float TAU = 6.2831853;

mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

/* Iteratively domain-warped flow field: silky, ribbon-like structure.
   chroma shifts the sampling phase, which is what separates the
   spectrum per channel (prism / iridescence). */
float field(vec2 uv, float chroma){
  vec2 p = uv * uScale;
  p += vec2(uDrift * 0.6 * sin(uTime * 0.13), uDrift * 0.5 * cos(uTime * 0.11));
  p = rot(uRot + uTime * uSwirl * 0.05) * p;

  float f = 1.0;
  float amp = 1.0;
  for(int i = 0; i < 16; i++){
    if(float(i) >= uIter) break;
    // Smooth curl-like warp — no noise, so it stays silky and clean.
    p += (uFlow * amp / f) * sin(p.yx * f * uWarp + uTime * 0.25 + chroma);
    p = rot(0.35) * p;
    f *= uLacunarity;
    amp *= 0.82;
  }
  // Ribbon-forming interference of the warped coordinates. Nested sines keep
  // the full [-1,1] swing (a plain sum collapses toward the mean and would
  // flatten both the hue sweep and the light/dark separation).
  float v = sin(p.x + sin(p.y * 0.8) * 1.3 + chroma) * 0.65
          + sin(p.y * 0.9 - sin(p.x * 0.6) * 1.1 - chroma) * 0.35;
  return 0.5 + 0.5 * v;   // → [0,1]
}

void main(){
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;
  // Composition: spread widens the field, center pull focuses it inward.
  vec2 suv = uv * mix(1.4, 0.55, uSpread);
  suv *= mix(1.0, 1.0 - 0.45 * length(uv), uCenterPull);

  // Three phase-offset samples → prismatic spectral separation.
  float o = uPrism * 0.55;
  float fr = field(suv, -o);
  float fg = field(suv,  0.0);
  float fb = field(suv, +o);
  vec3 v3 = vec3(fr, fg, fb);

  // Spectral palette held inside a narrow pastel band — a low amplitude keeps
  // it dreamy instead of a cheap full-spectrum rainbow. The per-channel field
  // offsets (prism) are what create the delicate iridescent fringes.
  float band = 0.55 + uPrism * 0.60;
  vec3 hue = vec3(0.58) + 0.30 * cos(TAU * (vec3(uRP, uGP, uBP) + v3 * band));

  // Blend toward the Color A/B tint, then pastel-lift toward white.
  hue = mix(hue, mix(uTintA, uTintB, fg), 0.20);
  hue = mix(hue, vec3(1.0), uSoftness * 0.32);

  // Intensity field: most of the frame stays deep, only the ribbon crests
  // catch light. This is what gives the layered volumetric read.
  float body  = smoothstep(0.12, 0.88, fg);
  float ridge = pow(clamp(1.0 - abs(fg - 0.5) * 2.0, 0.0, 1.0), 1.0 + uHighlights * 10.0);
  float inten = mix(0.26, 0.88, body) + ridge * uBloom * 1.0;
  inten *= 1.0 + uGlow * 0.5 * ridge;   // multiplicative glow (never blows out)

  vec3 col = hue * inten;

  // Large-scale soft fog field (very subtle, background only).
  float fog = 0.5 + 0.5 * sin(suv.x * 0.6 + suv.y * 0.45 + uTime * 0.08);
  col = mix(col, col * (0.7 + 0.55 * fog), uFogDensity * 0.6);

  // Radial depth fade so the nebula floats in atmosphere.
  float r = length(uv);
  float shell = 1.0 - smoothstep(uRadius, uRadius + uDepthFade + 0.05, r);
  col *= mix(1.0, 0.48 + 0.52 * shell, uDepthFade * 0.55);

  // Colour balance (cool ↔ warm), saturation, contrast, brightness.
  col *= mix(vec3(0.88, 0.96, 1.12), vec3(1.14, 0.99, 0.86), uBalance);
  float l2 = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(l2), col, uSaturation);
  col = (col - 0.5) * uContrast + 0.5;
  col *= uBrightness;

  // Blend against the background colour.
  col = mix(uBg, col, uBgMix);

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

interface GLCtx {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  u: Record<string, WebGLUniformLocation | null>;
}
let ctxGL: GLCtx | null = null;
let glFailed = false;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn("[nebulas] shader:", gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

const UNIFORMS = [
  "uRes","uTime","uIter","uLacunarity","uScale","uFlow","uWarp","uSwirl",
  "uSoftness","uContrast","uRadius","uDepthFade","uFogDensity","uGlow",
  "uBrightness","uRP","uGP","uBP","uDrift","uRot","uCenterPull","uSpread",
  "uSaturation","uHighlights","uBloom","uPrism","uBgMix","uBalance",
  "uBg","uTintA","uTintB",
];

function init(): GLCtx | null {
  if (glFailed) return null;
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
  }) as WebGLRenderingContext | null;
  if (!gl) { glFailed = true; return null; }

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { glFailed = true; return null; }
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn("[nebulas] link:", gl.getProgramInfoLog(prog));
    glFailed = true;
    return null;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u: Record<string, WebGLUniformLocation | null> = {};
  for (const n of UNIFORMS) u[n] = gl.getUniformLocation(prog, n);

  ctxGL = { canvas, gl, u };
  return ctxGL;
}

/** Quality tiers scale the resolution and warp iterations. */
const QUALITY: Record<string, { res: number; iter: number }> = {
  draft: { res: 0.6, iter: 0.7 },
  balanced: { res: 1.0, iter: 1.0 },
  high: { res: 1.25, iter: 1.25 },
};
const MAX_DIM = 1920;

export function renderNebulas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: NebulasSettings,
  timeSec: number,
): void {
  const g = ctxGL ?? init();
  if (!g) {
    ctx.fillStyle = s.background;
    ctx.fillRect(0, 0, w, h);
    return;
  }
  const { gl, u } = g;
  const q = QUALITY[s.qualityMode] ?? QUALITY.balanced;

  // Offscreen resolution = device pixels × Pixel Ratio × quality tier, capped.
  const scale = (0.5 + (s.pixelRatio / 100) * 1.0) * q.res;
  let bw = Math.max(2, Math.round(ctx.canvas.width * scale));
  let bh = Math.max(2, Math.round(ctx.canvas.height * scale));
  if (Math.max(bw, bh) > MAX_DIM) {
    const k = MAX_DIM / Math.max(bw, bh);
    bw = Math.round(bw * k);
    bh = Math.round(bh * k);
  }
  if (g.canvas.width !== bw || g.canvas.height !== bh) {
    g.canvas.width = bw;
    g.canvas.height = bh;
    gl.viewport(0, 0, bw, bh);
  }

  const time = s.autoAnimate ? timeSec * (0.15 + s.evolutionSpeed * 0.5) * s.loopSpeed : 0;
  const bg = hexToRgb(s.background);
  const a = hexToRgb(s.colorA);
  const b = hexToRgb(s.colorB);

  gl.uniform2f(u.uRes, bw, bh);
  gl.uniform1f(u.uTime, time);
  gl.uniform1f(u.uIter, Math.max(2, Math.min(16, Math.round(s.maxIterations * q.iter))));
  gl.uniform1f(u.uLacunarity, 1.15 + (s.stepSize / 100) * 0.9);
  gl.uniform1f(u.uScale, 0.9 + (s.detailScale / 100) * 4.6);
  gl.uniform1f(u.uFlow, 0.25 + (s.flowStrength / 100) * 1.7);
  gl.uniform1f(u.uWarp, 0.4 + (s.warp / 100) * 1.8);
  gl.uniform1f(u.uSwirl, s.swirl / 100);
  gl.uniform1f(u.uSoftness, s.softness / 100);
  gl.uniform1f(u.uContrast, 0.6 + (s.contrast / 100) * 1.1);
  gl.uniform1f(u.uRadius, 0.35 + (s.fieldRadius / 100) * 1.5);
  gl.uniform1f(u.uDepthFade, 0.1 + (s.depthFade / 100) * 1.6);
  gl.uniform1f(u.uFogDensity, s.fogDensity / 100);
  gl.uniform1f(u.uGlow, s.glowSoftness / 100);
  gl.uniform1f(u.uBrightness, 0.55 + (s.brightness / 100) * 1.05);
  gl.uniform1f(u.uRP, s.redPhase / 100);
  gl.uniform1f(u.uGP, s.greenPhase / 100);
  gl.uniform1f(u.uBP, s.bluePhase / 100);
  gl.uniform1f(u.uDrift, s.drift / 100);
  gl.uniform1f(u.uRot, (s.rotation * Math.PI) / 180);
  gl.uniform1f(u.uCenterPull, s.centerPull / 100);
  gl.uniform1f(u.uSpread, s.spread / 100);
  gl.uniform1f(u.uSaturation, 0.2 + (s.saturation / 100) * 1.5);
  gl.uniform1f(u.uHighlights, s.highlights / 100);
  gl.uniform1f(u.uBloom, (s.bloom / 100) * 0.6);
  gl.uniform1f(u.uPrism, s.prism / 100);
  gl.uniform1f(u.uBgMix, 0.25 + (s.backgroundMix / 100) * 0.75);
  gl.uniform1f(u.uBalance, s.colorBalance / 100);
  gl.uniform3f(u.uBg, bg.r / 255, bg.g / 255, bg.b / 255);
  gl.uniform3f(u.uTintA, a.r / 255, a.g / 255, a.b / 255);
  gl.uniform3f(u.uTintB, b.r / 255, b.g / 255, b.b / 255);

  gl.drawArrays(gl.TRIANGLES, 0, 3);

  ctx.fillStyle = s.background;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.globalAlpha = Math.min(1, Math.max(0, s.opacity / 100));
  ctx.drawImage(g.canvas, 0, 0, bw, bh, 0, 0, w, h);
  ctx.globalAlpha = 1;
  ctx.restore();
}
