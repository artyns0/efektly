import { Boxes, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Content map for the preview welcome state. Covers live in          */
/*  /public/images so they are served as plain static assets.          */
/* ------------------------------------------------------------------ */

export type WorkspaceCardId = "shader" | "three";

export interface WorkspaceCard {
  id: WorkspaceCardId;
  icon: LucideIcon;
  title: string;
  helper: string;
  cover: string;
  /** How the cover is framed inside its card. */
  coverClass: string;
}

/** Cover for the main upload card — landscape sits along the bottom edge. */
export const UPLOAD_COVER = "/images/uploadbox.png";

// Media Effects is intentionally omitted: Effects still needs imported media,
// so it has no value as an empty-state entry point. Effects mode itself, the
// top-nav tab, and the post-import workflow are all unchanged.
export const WORKSPACE_CARDS: WorkspaceCard[] = [
  {
    id: "shader",
    icon: Layers,
    title: "Shader Playground",
    helper: "Experiment with real-time shaders.",
    cover: "/images/shaderbox.png",
    coverClass: "object-center",
  },
  {
    id: "three",
    icon: Boxes,
    title: "3D Experiments",
    helper: "Explore interactive 3D visuals.",
    cover: "/images/3dbox.png",
    // Wide plate: keep the objects (right side of the frame) in view.
    coverClass: "object-right",
  },
];
