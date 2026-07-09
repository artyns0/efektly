import { create } from "zustand";
import { DEFAULT_PALETTE, SAMPLE_SOURCE } from "../data/mockData";
import { createInitialEffects, defaultEffectSettings } from "../data/effects";
import {
  createInitialShaderSettings,
  DEFAULT_PRESET,
  DEFAULT_SHADER_ANIMATION,
  SHADER_PRESETS,
} from "../data/shaders";
import type { EffectInstance, EffectSettingsPatch } from "../types/effects";
import type {
  ShaderAnimation,
  ShaderSettingsMap,
  ShaderSettingsPatch,
  ShaderTypeId,
} from "../types/shaders";
import type {
  AnimationDirection,
  AppMode,
  MediaType,
  ExportFormat,
  ExportFraming,
  Fps,
  InputSource,
  Orientation,
  PreviewQuality,
  RailSection,
  ResolutionId,
  SourceMedia,
  ThemePreference,
  VideoContainer,
  VideoQuality,
  VideoResolutionId,
} from "../types/app";
import type {
  ElasticBubble3DSettings,
  ImageParticles3DSettings,
  InteractiveParticles3DSettings,
  ThreeToolId,
} from "../types/three";
import {
  createInitialElasticBubble3D,
  createInitialImageParticles3D,
  createInitialInteractiveParticles3D,
  IMAGE_PARTICLE_PRESETS,
  INTERACTIVE_PARTICLE_PRESETS,
} from "../data/three";

/* ------------------------------------------------------------------ */
/*  Single source of truth for UI state.                               */
/*  This step only manages presentation state — no media processing.   */
/* ------------------------------------------------------------------ */

interface AppState {
  /* navigation */
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  /** Playground-shell rail selection (additive; classic shell ignores it). */
  railSection: RailSection;
  setRailSection: (section: RailSection) => void;
  /** Playground right (Export) panel open/collapsed. */
  exportPanelOpen: boolean;
  setExportPanelOpen: (open: boolean) => void;
  /** Playground right panel tab. */
  rightTab: "properties" | "export";
  setRightTab: (tab: "properties" | "export") => void;
  /** Editable project name (persisted to localStorage). */
  projectName: string;
  setProjectName: (name: string) => void;
  /* timeline (playground only) — general project clock */
  tlTime: number;
  tlDuration: number;
  tlPlaying: boolean;
  tlLoop: boolean;
  setTlTime: (t: number) => void; // scrub — also seeks video
  setTlPlaying: (p: boolean) => void; // play/pause — also drives video
  setTlLoop: (v: boolean) => void;
  setTlDuration: (d: number) => void;

  /* media panel */
  inputSource: InputSource;
  setInputSource: (source: InputSource) => void;
  source: SourceMedia;
  /* uploaded media — local-first, never leaves the browser */
  mediaType: MediaType | null;
  mediaImage: HTMLImageElement | null;
  mediaVideo: HTMLVideoElement | null;
  mediaUrl: string | null;
  setImageMedia: (payload: {
    image: HTMLImageElement;
    url: string;
    meta: SourceMedia;
  }) => void;
  setVideoMedia: (payload: {
    video: HTMLVideoElement;
    url: string;
    meta: SourceMedia;
  }) => void;
  clearMedia: () => void;
  /* video playback (mirrors the <video> element for the UI) */
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  loop: boolean;
  muted: boolean;
  togglePlay: () => void;
  setLoop: (loop: boolean) => void;
  toggleMute: () => void;
  seek: (time: number) => void;
  /* effect stack */
  effects: EffectInstance[];
  selectedEffectId: string;
  selectEffect: (id: string) => void;
  toggleEffect: (id: string) => void;
  /* playground: which effects are placed in the active stack (separate from
     enabled — a stacked effect can be toggled off without leaving the stack) */
  stackedEffectIds: string[];
  addToStack: (id: string) => void;
  removeFromStack: (id: string) => void;
  updateEffectSettings: (id: string, patch: EffectSettingsPatch) => void;
  /** Restore one effect's settings to its type defaults (keeps it in the stack). */
  resetEffect: (id: string) => void;
  speed: number; // 0.25x – 3x
  setSpeed: (speed: number) => void;
  direction: AnimationDirection;
  setDirection: (direction: AnimationDirection) => void;
  palette: string[];
  addPaletteColor: () => void;
  activeSwatch: number;
  setActiveSwatch: (index: number) => void;

  /* shader mode — procedural visuals, separate from media/effects */
  shaderType: ShaderTypeId;
  setShaderType: (type: ShaderTypeId) => void;
  shaderSettings: ShaderSettingsMap;
  updateShaderSettings: (type: ShaderTypeId, patch: ShaderSettingsPatch) => void;
  shaderPresetByType: Record<ShaderTypeId, string>;
  applyShaderPreset: (type: ShaderTypeId, presetName: string) => void;
  /** Restore one shader type's settings to its defaults. */
  resetShader: (type: ShaderTypeId) => void;
  shaderAnimation: ShaderAnimation;
  setShaderAnimation: (patch: Partial<ShaderAnimation>) => void;

  /* 3D workspace — real-time generative 3D, separate from shader mode */
  three3DTool: ThreeToolId;
  setThree3DTool: (tool: ThreeToolId) => void;
  elasticBubble3D: ElasticBubble3DSettings;
  updateElasticBubble3D: (patch: Partial<ElasticBubble3DSettings>) => void;
  interactiveParticles3D: InteractiveParticles3DSettings;
  updateInteractiveParticles3D: (patch: Partial<InteractiveParticles3DSettings>) => void;
  applyInteractiveParticlePreset: (name: string) => void;
  imageParticles3D: ImageParticles3DSettings;
  updateImageParticles3D: (patch: Partial<ImageParticles3DSettings>) => void;
  applyImageParticlePreset: (name: string) => void;
  /** Restore the active 3D tool's settings to its defaults. */
  resetThreeTool: () => void;

  /* export panel */
  format: ExportFormat;
  setFormat: (format: ExportFormat) => void;
  orientation: Orientation;
  setOrientation: (orientation: Orientation) => void;
  resolution: ResolutionId;
  setResolution: (resolution: ResolutionId) => void;
  fps: Fps;
  setFps: (fps: Fps) => void;
  quality: number; // 0 – 100
  setQuality: (quality: number) => void;
  /** Video export / recording resolution — separate from image `resolution`. */
  videoResolution: ResolutionId;
  setVideoResolution: (resolution: ResolutionId) => void;
  /* professional media video (MP4) export settings */
  videoExportResolution: VideoResolutionId;
  setVideoExportResolution: (r: VideoResolutionId) => void;
  videoContainer: VideoContainer;
  setVideoContainer: (c: VideoContainer) => void;
  videoQuality: VideoQuality;
  setVideoQuality: (q: VideoQuality) => void;
  customBitrateMbps: number;
  setCustomBitrateMbps: (mbps: number) => void;
  videoFileName: string;
  setVideoFileName: (name: string) => void;
  imageFileName: string;
  setImageFileName: (name: string) => void;
  /** Export framing (fit = letterbox, crop = center-fill). */
  imageFraming: ExportFraming;
  setImageFraming: (framing: ExportFraming) => void;
  videoFraming: ExportFraming;
  setVideoFraming: (framing: ExportFraming) => void;

  /* preview zoom — inspection only, never affects export */
  previewZoom: number; // 0.25 – 4
  setPreviewZoom: (zoom: number) => void;

  /* capture — latest still frame from the preview canvas */
  capturedFrame: HTMLCanvasElement | null;
  capturedThumb: string | null; // data URL for the thumbnail
  capturedAt: number | null; // epoch ms
  setCapture: (frame: HTMLCanvasElement, thumb: string) => void;
  clearCapture: () => void;

  /* recording — WebM clip of the preview canvas */
  isRecording: boolean;
  recordElapsedMs: number;
  recordedUrl: string | null;
  recordedSize: number | null;
  recordedDurationMs: number | null;
  setRecording: (v: boolean) => void;
  setRecordElapsed: (ms: number) => void;
  setRecordedClip: (payload: { blob: Blob; durationMs: number }) => void;
  clearRecording: () => void;

  /* settings panel */
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  gridVisible: boolean;
  setGridVisible: (visible: boolean) => void;
  previewQuality: PreviewQuality;
  setPreviewQuality: (quality: PreviewQuality) => void;
  rememberExport: boolean;
  setRememberExport: (value: boolean) => void;
  hardwareAccel: boolean;
  setHardwareAccel: (value: boolean) => void;
}

const EXTRA_SWATCHES = ["#D8B08C", "#A8C0B0", "#B45A3C", "#8A8170"];

const initialEffects = createInitialEffects();

/** Pause + detach a video element so it can be garbage-collected. */
function teardownVideo(video: HTMLVideoElement | null) {
  if (!video) return;
  video.pause();
  video.removeAttribute("src");
  video.load();
}

export const useAppStore = create<AppState>((set, get) => ({
  /* navigation */
  mode: "media",
  setMode: (mode) => set({ mode }),
  railSection: "source",
  setRailSection: (railSection) => set({ railSection }),
  exportPanelOpen: true,
  setExportPanelOpen: (exportPanelOpen) => set({ exportPanelOpen }),
  rightTab: "properties",
  setRightTab: (rightTab) => set({ rightTab }),
  projectName:
    (typeof localStorage !== "undefined" &&
      localStorage.getItem("efektly.projectName")) ||
    "Efektly Project 01",
  setProjectName: (projectName) => {
    try {
      localStorage.setItem("efektly.projectName", projectName);
    } catch {
      /* ignore storage failures */
    }
    set({ projectName });
  },

  /* timeline */
  tlTime: 0,
  tlDuration: 10,
  tlPlaying: false,
  tlLoop: true,
  setTlDuration: (tlDuration) => set({ tlDuration }),
  setTlLoop: (tlLoop) => set({ tlLoop }),
  setTlTime: (t) => {
    const { tlDuration, mediaVideo } = get();
    const clamped = Math.max(0, Math.min(t, tlDuration));
    if (mediaVideo) {
      mediaVideo.currentTime = isFinite(mediaVideo.duration)
        ? Math.min(clamped, mediaVideo.duration)
        : clamped;
    }
    set({ tlTime: clamped });
  },
  setTlPlaying: (p) => {
    const v = get().mediaVideo;
    if (v) {
      if (p) void v.play().catch(() => {});
      else v.pause();
    }
    set({ tlPlaying: p });
  },

  /* media */
  inputSource: "media",
  setInputSource: (inputSource) => set({ inputSource }),
  source: SAMPLE_SOURCE,
  mediaType: null,
  mediaImage: null,
  mediaVideo: null,
  mediaUrl: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  loop: true,
  muted: true,

  setImageMedia: ({ image, url, meta }) => {
    const { mediaUrl, mediaVideo } = get();
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    teardownVideo(mediaVideo);
    set({
      mediaType: "image",
      mediaImage: image,
      mediaVideo: null,
      mediaUrl: url,
      source: meta,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    });
  },

  setVideoMedia: ({ video, url, meta }) => {
    const { mediaUrl, mediaVideo, loop, muted } = get();
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    teardownVideo(mediaVideo);

    video.loop = loop;
    video.muted = muted;
    // Mirror the element's state into the store for the UI.
    video.addEventListener("timeupdate", () =>
      set({ currentTime: video.currentTime }),
    );
    video.addEventListener("durationchange", () =>
      set({ duration: isFinite(video.duration) ? video.duration : 0 }),
    );
    video.addEventListener("play", () => set({ isPlaying: true }));
    video.addEventListener("pause", () => set({ isPlaying: false }));
    video.addEventListener("ended", () => set({ isPlaying: false }));

    set({
      mediaType: "video",
      mediaImage: null,
      mediaVideo: video,
      mediaUrl: url,
      source: meta,
      isPlaying: false,
      currentTime: 0,
      duration: isFinite(video.duration) ? video.duration : 0,
    });
  },

  clearMedia: () => {
    const { mediaUrl, mediaVideo } = get();
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    teardownVideo(mediaVideo);
    set({
      mediaType: null,
      mediaImage: null,
      mediaVideo: null,
      mediaUrl: null,
      source: SAMPLE_SOURCE,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    });
  },

  togglePlay: () => {
    const v = get().mediaVideo;
    if (!v) return;
    if (v.paused || v.ended) void v.play();
    else v.pause();
  },
  setLoop: (loop) => {
    const v = get().mediaVideo;
    if (v) v.loop = loop;
    set({ loop });
  },
  toggleMute: () => {
    const muted = !get().muted;
    const v = get().mediaVideo;
    if (v) v.muted = muted;
    set({ muted });
  },
  seek: (time) => {
    const v = get().mediaVideo;
    if (v) v.currentTime = time;
    set({ currentTime: time });
  },
  effects: initialEffects,
  selectedEffectId: initialEffects[0].id,
  selectEffect: (selectedEffectId) => set({ selectedEffectId }),
  toggleEffect: (id) =>
    set((state) => ({
      effects: state.effects.map((fx) =>
        fx.id === id ? { ...fx, enabled: !fx.enabled } : fx,
      ),
    })),
  stackedEffectIds: initialEffects.filter((fx) => fx.enabled).map((fx) => fx.id),
  addToStack: (id) =>
    set((state) => ({
      stackedEffectIds: state.stackedEffectIds.includes(id)
        ? state.stackedEffectIds
        : [...state.stackedEffectIds, id],
      effects: state.effects.map((fx) =>
        fx.id === id ? { ...fx, enabled: true } : fx,
      ),
    })),
  removeFromStack: (id) =>
    set((state) => ({
      stackedEffectIds: state.stackedEffectIds.filter((x) => x !== id),
      effects: state.effects.map((fx) =>
        fx.id === id ? { ...fx, enabled: false } : fx,
      ),
    })),
  updateEffectSettings: (id, patch) =>
    set((state) => ({
      effects: state.effects.map((fx) =>
        fx.id === id
          ? ({
              ...fx,
              settings: { ...fx.settings, ...(patch as object) },
            } as EffectInstance)
          : fx,
      ),
    })),
  resetEffect: (id) =>
    set((state) => ({
      effects: state.effects.map((fx) =>
        fx.id === id
          ? ({ ...fx, settings: defaultEffectSettings(fx.type) } as EffectInstance)
          : fx,
      ),
    })),
  speed: 1.25,
  setSpeed: (speed) => set({ speed }),
  direction: "loop",
  setDirection: (direction) => set({ direction }),
  palette: DEFAULT_PALETTE,
  activeSwatch: 1,
  setActiveSwatch: (activeSwatch) => set({ activeSwatch }),
  addPaletteColor: () =>
    set((state) => {
      const next = EXTRA_SWATCHES[state.palette.length % EXTRA_SWATCHES.length];
      return { palette: [...state.palette, next] };
    }),

  /* shader mode */
  shaderType: "meshLiquid",
  setShaderType: (shaderType) => set({ shaderType }),
  shaderSettings: createInitialShaderSettings(),
  updateShaderSettings: (type, patch) =>
    set((state) => ({
      shaderSettings: {
        ...state.shaderSettings,
        [type]: { ...state.shaderSettings[type], ...patch },
      },
    })),
  shaderPresetByType: { ...DEFAULT_PRESET },
  applyShaderPreset: (type, presetName) =>
    set((state) => {
      const preset = SHADER_PRESETS[type].find((p) => p.name === presetName);
      if (!preset) return {};
      return {
        shaderPresetByType: { ...state.shaderPresetByType, [type]: presetName },
        shaderSettings: {
          ...state.shaderSettings,
          [type]: { ...state.shaderSettings[type], ...preset.settings },
        },
      };
    }),
  resetShader: (type) =>
    set((state) => ({
      shaderSettings: {
        ...state.shaderSettings,
        [type]: createInitialShaderSettings()[type],
      },
      shaderPresetByType: {
        ...state.shaderPresetByType,
        [type]: DEFAULT_PRESET[type],
      },
    })),
  shaderAnimation: { ...DEFAULT_SHADER_ANIMATION },
  setShaderAnimation: (patch) =>
    set((state) => ({ shaderAnimation: { ...state.shaderAnimation, ...patch } })),

  /* 3D workspace */
  three3DTool: "interactiveParticles3D",
  setThree3DTool: (three3DTool) => set({ three3DTool }),
  elasticBubble3D: createInitialElasticBubble3D(),
  updateElasticBubble3D: (patch) =>
    set((state) => ({ elasticBubble3D: { ...state.elasticBubble3D, ...patch } })),
  interactiveParticles3D: createInitialInteractiveParticles3D(),
  updateInteractiveParticles3D: (patch) =>
    set((state) => ({
      interactiveParticles3D: { ...state.interactiveParticles3D, ...patch },
    })),
  applyInteractiveParticlePreset: (name) =>
    set((state) => {
      const p = INTERACTIVE_PARTICLE_PRESETS[name];
      if (!p) return {};
      return {
        interactiveParticles3D: { ...state.interactiveParticles3D, ...p, preset: name },
      };
    }),
  imageParticles3D: createInitialImageParticles3D(),
  updateImageParticles3D: (patch) =>
    set((state) => ({ imageParticles3D: { ...state.imageParticles3D, ...patch } })),
  applyImageParticlePreset: (name) =>
    set((state) => {
      const p = IMAGE_PARTICLE_PRESETS[name];
      if (!p) return {};
      return { imageParticles3D: { ...state.imageParticles3D, ...p, preset: name } };
    }),
  resetThreeTool: () =>
    set((state) => {
      switch (state.three3DTool) {
        case "elasticBubble3D":
          return { elasticBubble3D: createInitialElasticBubble3D() };
        case "imageParticles3D":
          return { imageParticles3D: createInitialImageParticles3D() };
        default:
          return { interactiveParticles3D: createInitialInteractiveParticles3D() };
      }
    }),

  /* export */
  format: "png",
  setFormat: (format) => set({ format }),
  orientation: "horizontal",
  setOrientation: (orientation) => set({ orientation }),
  resolution: "original",
  setResolution: (resolution) => set({ resolution }),
  fps: 30,
  setFps: (fps) => set({ fps }),
  quality: 90,
  setQuality: (quality) => set({ quality }),
  videoResolution: "original",
  setVideoResolution: (videoResolution) => set({ videoResolution }),
  videoExportResolution: "1080p",
  setVideoExportResolution: (videoExportResolution) => set({ videoExportResolution }),
  videoContainer: "mp4",
  setVideoContainer: (videoContainer) => set({ videoContainer }),
  videoQuality: "recommended",
  setVideoQuality: (videoQuality) => set({ videoQuality }),
  customBitrateMbps: 12,
  setCustomBitrateMbps: (customBitrateMbps) => set({ customBitrateMbps }),
  videoFileName: "",
  setVideoFileName: (videoFileName) => set({ videoFileName }),
  imageFileName: "",
  setImageFileName: (imageFileName) => set({ imageFileName }),
  imageFraming: "fit",
  setImageFraming: (imageFraming) => set({ imageFraming }),
  videoFraming: "fit",
  setVideoFraming: (videoFraming) => set({ videoFraming }),

  /* preview zoom */
  previewZoom: 1,
  setPreviewZoom: (zoom) =>
    set({ previewZoom: Math.min(4, Math.max(0.25, zoom)) }),

  /* capture (latest still frame) */
  capturedFrame: null,
  capturedThumb: null,
  capturedAt: null,
  setCapture: (frame, thumb) =>
    set({ capturedFrame: frame, capturedThumb: thumb, capturedAt: Date.now() }),
  clearCapture: () =>
    set({ capturedFrame: null, capturedThumb: null, capturedAt: null }),

  /* recording (WebM clip) */
  isRecording: false,
  recordElapsedMs: 0,
  recordedUrl: null,
  recordedSize: null,
  recordedDurationMs: null,
  setRecording: (isRecording) =>
    set({ isRecording, recordElapsedMs: isRecording ? 0 : get().recordElapsedMs }),
  setRecordElapsed: (recordElapsedMs) => set({ recordElapsedMs }),
  setRecordedClip: ({ blob, durationMs }) => {
    const prev = get().recordedUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({
      recordedUrl: URL.createObjectURL(blob),
      recordedSize: blob.size,
      recordedDurationMs: durationMs,
    });
  },
  clearRecording: () => {
    const prev = get().recordedUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({ recordedUrl: null, recordedSize: null, recordedDurationMs: null });
  },

  /* settings */
  theme: "onyx",
  setTheme: (theme) => set({ theme }),
  gridVisible: true,
  setGridVisible: (gridVisible) => set({ gridVisible }),
  previewQuality: "balanced",
  setPreviewQuality: (previewQuality) => set({ previewQuality }),
  rememberExport: true,
  setRememberExport: (rememberExport) => set({ rememberExport }),
  hardwareAccel: true,
  setHardwareAccel: (hardwareAccel) => set({ hardwareAccel }),
}));
