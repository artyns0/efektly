import { useEffect, useRef } from "react";
import type { FlapMood } from "../../lib/flapEvents";

interface FlapCanvasProps {
  mood: FlapMood;
  gaze: { x: number; y: number };
  quiet: boolean;
}

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_orbit;
  uniform float u_stateTime;
  uniform vec2 u_gaze;
  uniform float u_watch;
  uniform float u_sleep;
  uniform float u_wow;
  uniform float u_work;
  uniform float u_celebrate;
  uniform float u_confused;
  uniform float u_motion;

  const float PI = 3.14159265359;

  mat2 rotate2d(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  float squareParticle(vec2 p, vec2 position, float size, float rotation) {
    vec2 q = rotate2d(rotation) * (p - position);
    return sdRoundBox(q, vec2(size), size * 0.22);
  }

  float smoothMax(float a, float b, float softness) {
    float h = clamp(0.5 + 0.5 * (a - b) / softness, 0.0, 1.0);
    return mix(b, a, h) + softness * h * (1.0 - h);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

    float floatY = sin(u_time * 0.72) * 0.009 * u_motion;
    float sleepyBreath = u_sleep * sin(u_time * 0.46) * 0.004;
    float celebrateJump = u_celebrate * (0.055 + 0.040 * abs(sin(u_stateTime * 7.5)));
    vec2 center = vec2(0.0, 0.025 + floatY + sleepyBreath + celebrateJump - u_sleep * 0.070);
    vec2 p = uv - center;

    float bodyTilt = u_celebrate * sin(u_stateTime * 8.0) * 0.07
      + u_confused * (0.065 + sin(u_stateTime * 5.0) * 0.025)
      + u_watch * u_gaze.x * 0.025;
    p = rotate2d(bodyTilt) * p;

    vec2 bodyScale = mix(vec2(1.0), vec2(1.16, 0.73), u_sleep);
    bodyScale.x += u_celebrate * sin(u_stateTime * 7.5) * 0.035;
    vec2 shapeP = p / bodyScale;
    float angle = atan(shapeP.y, shapeP.x);
    float localAngle = angle - u_orbit;
    float angleWarp = localAngle
      + sin(localAngle * 2.0 + u_time * 0.17) * 0.038
      + sin(localAngle * 3.0 - u_time * 0.11) * 0.022;

    float breathe = sin(u_time * 1.07) * 0.006 * u_motion;
    float wowPulse = u_wow * sin(min(u_stateTime, 0.8) * PI) * 0.035;
    float lobeEnvelope = 0.88
      + 0.20 * sin(localAngle + 0.72 + sin(u_time * 0.13) * 0.35)
      + 0.10 * cos(localAngle * 2.0 - 1.10 + cos(u_time * 0.09) * 0.28);
    float flowVariation = 0.93 + 0.09 * sin(u_time * 0.23) + 0.035 * sin(u_time * 0.61);
    float awakeRadius = 0.306 + breathe + wowPulse
      + 0.056 * cos(5.0 * angleWarp) * lobeEnvelope * flowVariation
      + 0.015 * sin(localAngle * 3.0 + 0.55 + u_time * 0.12)
      + 0.011 * cos(localAngle * 2.0 - 0.35 - u_time * 0.075)
      + 0.006 * sin(localAngle * 7.0 + u_time * 0.14);
    float sleepAngle = angle + 0.28 + sin(u_time * 0.10) * 0.035;
    float sleepRadius = 0.302
      + 0.031 * cos(3.0 * sleepAngle)
      + 0.021 * sin(2.0 * sleepAngle - 0.75)
      + 0.009 * cos(4.0 * sleepAngle + 0.45)
      + sin(u_time * 0.46) * 0.003;
    float attentiveStretch = u_watch * 0.010
      * cos(angle - atan(u_gaze.y, u_gaze.x + 0.0001));
    float radius = mix(awakeRadius, sleepRadius, u_sleep) + attentiveStretch;

    float rawDist = length(shapeP) - radius;
    float settledFloor = -p.y - 0.215;
    float sleepingDist = smoothMax(rawDist, settledFloor, 0.032);
    float dist = mix(rawDist, sleepingDist, u_sleep);
    float body = 1.0 - smoothstep(-0.010, 0.012, dist);
    float rim = exp(-abs(dist) * 47.0);
    float outside = exp(-max(dist, 0.0) * 16.5);
    float edgeZone = smoothstep(-0.205, -0.003, dist);

    vec2 lightDir = normalize(vec2(-0.58, 0.82));
    float directional = 0.5 + 0.5 * dot(normalize(shapeP + vec2(0.0001)), lightDir);
    vec3 coreColor = vec3(0.105, 0.045, 0.027);
    vec3 warmCore = vec3(0.31, 0.075, 0.018);
    vec3 edgeColor = vec3(1.0, 0.245, 0.018);
    vec3 goldColor = vec3(1.0, 0.66, 0.10);

    vec3 bodyColor = mix(coreColor, warmCore, smoothstep(-0.30, -0.10, dist));
    bodyColor = mix(bodyColor, edgeColor, pow(edgeZone, 1.75) * 0.94);
    bodyColor += rim * mix(edgeColor, goldColor, directional) * (0.34 + directional * 0.48);

    float grain = hash21(gl_FragCoord.xy + floor(u_time * 2.0));
    bodyColor += (grain - 0.5) * 0.018 * body;

    vec3 glowColor = mix(vec3(0.88, 0.08, 0.005), edgeColor, directional * 0.35);
    float glowAlpha = outside * 0.19 * (1.0 - body);
    vec3 color = glowColor;
    float alpha = glowAlpha;
    color = mix(color, bodyColor, body);
    alpha = max(alpha, body);

    float sleepy = u_sleep;
    float blinkClock = mod(u_time + 1.25, 5.65);
    float blinkDistance = min(abs(blinkClock - 0.10), abs(blinkClock - 0.29));
    float autoBlink = (1.0 - smoothstep(0.025, 0.085, blinkDistance))
      * (1.0 - sleepy) * (1.0 - u_wow) * (1.0 - u_celebrate * 0.65);
    vec2 eyeDims = mix(vec2(0.027, 0.066), vec2(0.044, 0.008), sleepy);
    eyeDims += vec2(u_wow * 0.009, u_wow * 0.022);
    eyeDims *= mix(vec2(1.0), vec2(0.92, 0.84), u_work);
    eyeDims.y *= mix(1.0, 0.10, autoBlink);
    float eyeY = mix(0.008, -0.042, sleepy);
    float eyeSep = mix(0.088, 0.086, sleepy) - u_wow * 0.006;
    vec2 gazeOffset = u_gaze * vec2(0.036, 0.026) * (1.0 - sleepy);
    float eyeTurn = -u_gaze.x * 0.18 * (1.0 - sleepy);

    vec2 leftEyeDims = eyeDims * vec2(1.0 + u_confused * 0.12, 1.0 - u_confused * 0.20);
    vec2 rightEyeDims = eyeDims * vec2(1.0 - u_confused * 0.08, 1.0 + u_confused * 0.15);
    vec2 leftEyeP = rotate2d(eyeTurn - u_confused * 0.10)
      * (p - vec2(-eyeSep, eyeY + u_confused * 0.010) - gazeOffset);
    vec2 rightEyeP = rotate2d(eyeTurn + u_confused * 0.08)
      * (p - vec2(eyeSep, eyeY - u_confused * 0.008) - gazeOffset);
    float leftEyeDist = sdRoundBox(leftEyeP, leftEyeDims, min(leftEyeDims.x, leftEyeDims.y) * 0.92);
    float rightEyeDist = sdRoundBox(rightEyeP, rightEyeDims, min(rightEyeDims.x, rightEyeDims.y) * 0.92);
    float eyeDist = min(leftEyeDist, rightEyeDist);
    float eyes = (1.0 - smoothstep(-0.005, 0.006, eyeDist)) * body;
    float eyeGlow = exp(-max(eyeDist, 0.0) * 72.0) * 0.36 * body;
    vec3 eyeColor = mix(vec3(1.0, 0.48, 0.055), vec3(1.0, 0.93, 0.48),
      0.66 + 0.34 * directional);
    color = mix(color, eyeColor, max(eyes, eyeGlow));
    alpha = max(alpha, max(eyes, eyeGlow));

    vec2 floorPoint = vec2(
      uv.x / mix(0.30, 0.38, sleepy),
      (uv.y + mix(0.340, 0.285, sleepy) + celebrateJump * 0.45) / 0.032
    );
    float floorShape = exp(-dot(floorPoint, floorPoint));
    float floorAlpha = floorShape * 0.20 * (1.0 - u_celebrate * 0.55);
    color = mix(color, vec3(0.82, 0.105, 0.005), floorAlpha * (1.0 - alpha));
    alpha = max(alpha, floorAlpha);

    float particleMotion = 0.035 * sin(u_stateTime * 4.0);
    float confettiDist = 10.0;
    confettiDist = min(confettiDist, squareParticle(uv, vec2(-0.47 - particleMotion, 0.13), 0.025, 0.25 + u_stateTime));
    confettiDist = min(confettiDist, squareParticle(uv, vec2(0.48 + particleMotion, 0.08), 0.022, -0.4 - u_stateTime));
    confettiDist = min(confettiDist, squareParticle(uv, vec2(-0.37, -0.30 - particleMotion), 0.021, 0.8 + u_stateTime));
    confettiDist = min(confettiDist, squareParticle(uv, vec2(0.38, -0.27 - particleMotion), 0.024, -0.7 + u_stateTime));
    confettiDist = min(confettiDist, squareParticle(uv, vec2(0.02, -0.39 - particleMotion), 0.020, u_stateTime));
    float confetti = (1.0 - smoothstep(-0.006, 0.010, confettiDist)) * u_celebrate;
    float confettiGlow = exp(-max(confettiDist, 0.0) * 50.0) * 0.28 * u_celebrate;
    color = mix(color, goldColor, max(confetti, confettiGlow));
    alpha = max(alpha, max(confetti, confettiGlow));

    float sparkDist = 10.0;
    sparkDist = min(sparkDist, squareParticle(uv, vec2(-0.47, 0.18), 0.016, PI * 0.25));
    sparkDist = min(sparkDist, squareParticle(uv, vec2(0.49, 0.06), 0.014, PI * 0.25));
    sparkDist = min(sparkDist, squareParticle(uv, vec2(-0.40, -0.12), 0.010, PI * 0.25));
    float sparks = (1.0 - smoothstep(-0.005, 0.009, sparkDist)) * u_wow;
    float sparkGlow = exp(-max(sparkDist, 0.0) * 58.0) * 0.22 * u_wow;
    color = mix(color, vec3(1.0, 0.78, 0.22), max(sparks, sparkGlow));
    alpha = max(alpha, max(sparks, sparkGlow));

    float dots = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      vec2 dotPosition = vec2(0.39 + fi * 0.055, 0.27 + sin(u_stateTime * 5.5 + fi * 1.1) * 0.012);
      float dotDist = length(uv - dotPosition) - 0.010;
      dots = max(dots, 1.0 - smoothstep(-0.004, 0.006, dotDist));
    }
    dots *= u_work;
    color = mix(color, goldColor, dots);
    alpha = max(alpha, dots);

    float sleepCycleA = fract(u_time * 0.145 + 0.10);
    float sleepCycleB = fract(u_time * 0.145 + 0.58);
    vec2 sleepPosA = vec2(0.27 + sin(u_time * 0.35) * 0.025, 0.12 + sleepCycleA * 0.34);
    vec2 sleepPosB = vec2(0.38 + cos(u_time * 0.28) * 0.020, 0.08 + sleepCycleB * 0.30);
    float sleepParticleDist = min(
      squareParticle(uv, sleepPosA, mix(0.010, 0.005, sleepCycleA), PI * 0.25),
      squareParticle(uv, sleepPosB, mix(0.008, 0.004, sleepCycleB), PI * 0.25)
    );
    float sleepFade = max(sin(sleepCycleA * PI), sin(sleepCycleB * PI));
    float sleepParticle = (1.0 - smoothstep(-0.004, 0.006, sleepParticleDist))
      * sleepy * sleepFade * 0.72;
    float sleepParticleGlow = exp(-max(sleepParticleDist, 0.0) * 60.0)
      * sleepy * sleepFade * 0.13;
    color = mix(color, vec3(1.0, 0.52, 0.06), max(sleepParticle, sleepParticleGlow));
    alpha = max(alpha, max(sleepParticle, sleepParticleGlow));

    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create Flap shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) ?? "Unknown shader error";
    gl.deleteShader(shader);
    throw new Error(`Flap shader failed to compile: ${info}`);
  }
  return shader;
}

export function FlapCanvas({ mood, gaze, quiet }: FlapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef({ mood, gaze, quiet });

  useEffect(() => {
    runtimeRef.current = { mood, gaze, quiet };
  }, [gaze, mood, quiet]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      depth: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!program) throw new Error("Unable to create Flap shader program.");
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Flap shader failed to link: ${gl.getProgramInfoLog(program)}`);
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(program);

    const uniforms = {
      resolution: gl.getUniformLocation(program, "u_resolution"),
      time: gl.getUniformLocation(program, "u_time"),
      orbit: gl.getUniformLocation(program, "u_orbit"),
      stateTime: gl.getUniformLocation(program, "u_stateTime"),
      gaze: gl.getUniformLocation(program, "u_gaze"),
      watch: gl.getUniformLocation(program, "u_watch"),
      sleep: gl.getUniformLocation(program, "u_sleep"),
      wow: gl.getUniformLocation(program, "u_wow"),
      work: gl.getUniformLocation(program, "u_work"),
      celebrate: gl.getUniformLocation(program, "u_celebrate"),
      confused: gl.getUniformLocation(program, "u_confused"),
      motion: gl.getUniformLocation(program, "u_motion"),
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const channels = {
      watch: 0,
      sleep: 0,
      wow: 0,
      work: 0,
      celebrate: 0,
      confused: 0,
    };
    const smoothedGaze = { x: 0, y: 0 };
    let lastMood = runtimeRef.current.mood;
    let moodStartedAt = performance.now();
    let previousFrame = performance.now();
    let simulationTime = 0;
    let orbitPhase = 0;
    let animationFrame = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const draw = (now: number) => {
      resize();
      const runtime = runtimeRef.current;
      const dt = Math.min(0.05, Math.max(0, (now - previousFrame) / 1000));
      previousFrame = now;

      if (runtime.mood !== lastMood) {
        lastMood = runtime.mood;
        moodStartedAt = now;
      }

      const motion = runtime.quiet || prefersReducedMotion.matches ? 0.08 : 1;
      simulationTime += dt * motion;
      const stateTime = (now - moodStartedAt) / 1000;
      const blend = 1 - Math.exp(-dt * 7.5);
      const targets = {
        watch: runtime.mood === "watching" ? 1 : 0,
        sleep: runtime.mood === "sleepy" ? 1 : 0,
        wow: runtime.mood === "wow" ? 1 : 0,
        work: runtime.mood === "working" ? 1 : 0,
        celebrate: runtime.mood === "celebrate" ? 1 : 0,
        confused: runtime.mood === "confused" ? 1 : 0,
      };

      channels.watch += (targets.watch - channels.watch) * blend;
      channels.sleep += (targets.sleep - channels.sleep) * blend;
      channels.wow += (targets.wow - channels.wow) * blend;
      channels.work += (targets.work - channels.work) * blend;
      channels.celebrate += (targets.celebrate - channels.celebrate) * blend;
      channels.confused += (targets.confused - channels.confused) * blend;
      smoothedGaze.x += (runtime.gaze.x - smoothedGaze.x) * blend;
      smoothedGaze.y += (runtime.gaze.y - smoothedGaze.y) * blend;

      const organicSpeed =
        0.10 +
        Math.sin(simulationTime * 0.31) * 0.018 +
        Math.sin(simulationTime * 0.13 + 1.4) * 0.011;
      const reactionSpeed = channels.work * 0.24 + channels.celebrate * 0.12;
      const sleepSlowdown = 1 - channels.sleep * 0.88;
      orbitPhase += dt * motion * (organicSpeed + reactionSpeed) * sleepSlowdown;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.time, simulationTime);
      gl.uniform1f(uniforms.orbit, orbitPhase);
      gl.uniform1f(uniforms.stateTime, stateTime);
      gl.uniform2f(uniforms.gaze, smoothedGaze.x, smoothedGaze.y);
      gl.uniform1f(uniforms.watch, channels.watch);
      gl.uniform1f(uniforms.sleep, channels.sleep);
      gl.uniform1f(uniforms.wow, channels.wow);
      gl.uniform1f(uniforms.work, channels.work);
      gl.uniform1f(uniforms.celebrate, channels.celebrate);
      gl.uniform1f(uniforms.confused, channels.confused);
      gl.uniform1f(uniforms.motion, motion);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationFrame = window.requestAnimationFrame(draw);
    };

    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return <canvas ref={canvasRef} className="flap-canvas" aria-hidden="true" />;
}
