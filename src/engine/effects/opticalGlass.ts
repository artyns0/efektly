import type { OpticalGlassSettings } from "../../types/effects";
import type { FitRect } from "./dotMatrix";

/* WebGL refraction pass. The input is uploaded once per rendered frame and
   sampled through procedural cylindrical, block, slit, or soft lenses. */

const VERTEX = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform vec4 u_panel;
uniform float u_mode;
uniform float u_direction;
uniform float u_cells;
uniform float u_refraction;
uniform float u_curvature;
uniform float u_blur;
uniform float u_frost;
uniform float u_gap;
uniform float u_edgeLight;
uniform float u_chroma;
uniform float u_feather;
uniform float u_mix;

in vec2 v_uv;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float panelMask(vec2 p) {
  vec2 a = p - u_panel.xy;
  vec2 b = u_panel.xy + u_panel.zw - p;
  float d = min(min(a.x, a.y), min(b.x, b.y));
  float feather = max(0.00001, u_feather * 0.08);
  return smoothstep(0.0, feather, d);
}

vec3 sampleBlurred(vec2 topUv, vec2 dispersion) {
  vec2 uv = vec2(topUv.x, 1.0 - topUv.y);
  vec2 px = u_blur * 10.0 / max(u_resolution, vec2(1.0));
  vec2 o1 = vec2(px.x, 0.0);
  vec2 o2 = vec2(0.0, px.y);
  vec2 o3 = vec2(px.x, px.y) * 0.7071;

  vec3 c = texture(u_image, uv).rgb * 0.28;
  c += texture(u_image, uv + o1).rgb * 0.09;
  c += texture(u_image, uv - o1).rgb * 0.09;
  c += texture(u_image, uv + o2).rgb * 0.09;
  c += texture(u_image, uv - o2).rgb * 0.09;
  c += texture(u_image, uv + o3).rgb * 0.09;
  c += texture(u_image, uv - o3).rgb * 0.09;
  c += texture(u_image, uv + vec2(o3.x, -o3.y)).rgb * 0.09;
  c += texture(u_image, uv + vec2(-o3.x, o3.y)).rgb * 0.09;

  if (u_chroma > 0.0001) {
    c.r = texture(u_image, uv + dispersion).r;
    c.b = texture(u_image, uv - dispersion).b;
  }
  return c;
}

void main() {
  vec2 p = vec2(v_uv.x, 1.0 - v_uv.y);
  vec3 original = texture(u_image, v_uv).rgb;
  float mask = panelMask(p);
  if (mask <= 0.0) {
    outColor = vec4(original, 1.0);
    return;
  }

  vec2 local = clamp((p - u_panel.xy) / max(u_panel.zw, vec2(0.0001)), 0.0, 1.0);
  vec2 qLocal = local;
  vec2 lensNormal = vec2(1.0, 0.0);
  float edge = 0.0;
  float seam = 0.0;
  float strength = u_refraction;

  if (u_mode < 0.5 || (u_mode > 1.5 && u_mode < 2.5)) {
    float axis = u_direction < 0.5 ? local.x : local.y;
    float cell = floor(axis * u_cells);
    float phase = fract(axis * u_cells);
    float centered = phase - 0.5;
    float shaped = sign(centered) * pow(abs(centered) * 2.0, mix(1.0, 2.8, u_curvature)) * 0.5;
    float bend = (centered - shaped) * strength / u_cells * 1.9;
    if (u_mode > 1.5) {
      bend += sign(centered) * pow(abs(centered) * 2.0, 5.0) * strength / u_cells * 0.75;
    }
    if (u_direction < 0.5) qLocal.x += bend;
    else qLocal.y += bend;
    lensNormal = u_direction < 0.5 ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    edge = pow(abs(centered) * 2.0, 8.0);
    seam = smoothstep(0.5 - u_gap * 0.08, 0.5, abs(centered));
    qLocal += (hash(vec2(cell, phase)) - 0.5) * u_frost * 0.003;
  } else if (u_mode < 1.5) {
    vec2 grid = local * u_cells;
    vec2 phase = fract(grid) - 0.5;
    vec2 shaped = sign(phase) * pow(abs(phase) * 2.0, vec2(mix(1.0, 2.8, u_curvature))) * 0.5;
    qLocal += (phase - shaped) * strength / u_cells * 1.7;
    float ex = pow(abs(phase.x) * 2.0, 8.0);
    float ey = pow(abs(phase.y) * 2.0, 8.0);
    edge = max(ex, ey);
    seam = max(
      smoothstep(0.5 - u_gap * 0.08, 0.5, abs(phase.x)),
      smoothstep(0.5 - u_gap * 0.08, 0.5, abs(phase.y))
    );
    lensNormal = normalize(phase + vec2(0.0001));
    qLocal += (hash(floor(grid)) - 0.5) * u_frost * 0.004;
  } else {
    vec2 d = local - 0.5;
    float aspect = u_panel.x > -2.0 ? u_panel.z / max(u_panel.w, 0.0001) : 1.0;
    vec2 da = vec2(d.x * aspect, d.y);
    float r = length(da) / max(0.5, 0.5 * aspect);
    float lens = max(0.0, 1.0 - r * r);
    qLocal = 0.5 + d * (1.0 - strength * lens * mix(0.18, 0.58, u_curvature));
    lensNormal = normalize(d + vec2(0.0001));
    edge = smoothstep(0.68, 1.0, r);
  }

  qLocal = clamp(qLocal, 0.0, 1.0);
  vec2 q = u_panel.xy + qLocal * u_panel.zw;
  vec2 dispersion = lensNormal * u_chroma * 4.0 / max(u_resolution, vec2(1.0));
  dispersion.y *= -1.0;
  vec3 glass = sampleBlurred(q, dispersion);

  float sparkle = edge * u_edgeLight * (0.7 + 0.3 * hash(floor(p * u_resolution * 0.25)));
  glass += sparkle;
  glass *= 1.0 - seam * u_gap * 0.5;
  float grain = (hash(p * u_resolution + qLocal * 917.0) - 0.5) * u_frost * 0.14;
  glass += grain;

  float amount = mask * u_mix;
  outColor = vec4(mix(original, glass, amount), 1.0);
}`;

interface GlassRenderer {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  texture: WebGLTexture;
  uniforms: Record<string, WebGLUniformLocation | null>;
}

let renderer: GlassRenderer | null | undefined;

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "Unknown Optical Glass shader error";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createRenderer(): GlassRenderer | null {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      preserveDrawingBuffer: true,
    });
    if (!gl) return null;

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? "Could not link Optical Glass shader");
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(gl.getUniformLocation(program, "u_image"), 0);

    const names = [
      "u_resolution", "u_panel", "u_mode", "u_direction", "u_cells",
      "u_refraction", "u_curvature", "u_blur", "u_frost", "u_gap",
      "u_edgeLight", "u_chroma", "u_feather", "u_mix",
    ];
    const uniforms = Object.fromEntries(names.map((name) => [name, gl.getUniformLocation(program, name)]));
    return { canvas, gl, program, texture, uniforms };
  } catch (error) {
    console.error("Optical Glass renderer could not start:", error);
    return null;
  }
}

function value01(value: number): number {
  return Math.max(0, Math.min(100, value)) / 100;
}

export function renderOpticalGlass(
  ctx: CanvasRenderingContext2D,
  input: CanvasImageSource,
  rect: FitRect,
  settings: OpticalGlassSettings,
): void {
  if (renderer === undefined) renderer = createRenderer();
  if (!renderer) return;

  const source = input as HTMLCanvasElement;
  const w = Math.max(1, source.width || Math.round(rect.dw));
  const h = Math.max(1, source.height || Math.round(rect.dh));
  const { canvas, gl, uniforms: u } = renderer;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }

  gl.viewport(0, 0, w, h);
  gl.useProgram(renderer.program);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, renderer.texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    source as TexImageSource,
  );

  const panelX = value01(settings.panelX);
  const panelY = value01(settings.panelY);
  const panelW = Math.max(0.01, Math.min(1 - panelX, value01(settings.panelWidth)));
  const panelH = Math.max(0.01, Math.min(1 - panelY, value01(settings.panelHeight)));
  const mode = settings.mode === "blocks" ? 1 : settings.mode === "slit" ? 2 : settings.mode === "soft-lens" ? 3 : 0;

  gl.uniform2f(u.u_resolution, w, h);
  gl.uniform4f(u.u_panel, panelX, panelY, panelW, panelH);
  gl.uniform1f(u.u_mode, mode);
  gl.uniform1f(u.u_direction, settings.direction === "vertical" ? 0 : 1);
  gl.uniform1f(u.u_cells, Math.max(2, settings.cells));
  gl.uniform1f(u.u_refraction, value01(settings.refraction));
  gl.uniform1f(u.u_curvature, value01(settings.curvature));
  gl.uniform1f(u.u_blur, value01(settings.blur));
  gl.uniform1f(u.u_frost, value01(settings.frost));
  gl.uniform1f(u.u_gap, value01(settings.gap));
  gl.uniform1f(u.u_edgeLight, value01(settings.edgeLight) * 0.35);
  gl.uniform1f(u.u_chroma, value01(settings.chromaticAberration));
  gl.uniform1f(u.u_feather, value01(settings.feather));
  gl.uniform1f(u.u_mix, value01(settings.mix));
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.dx, rect.dy, rect.dw, rect.dh);
  ctx.clip();
  ctx.clearRect(rect.dx, rect.dy, rect.dw, rect.dh);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(canvas, rect.dx, rect.dy, rect.dw, rect.dh);
  ctx.restore();
}
