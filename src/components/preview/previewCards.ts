import { Boxes, Grid2x2, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Content map for the preview welcome state. Covers live in          */
/*  /public/preview so they are served as plain static assets.         */
/* ------------------------------------------------------------------ */

export type WorkspaceCardId = "effects" | "shader" | "three";

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

export const WORKSPACE_CARDS: WorkspaceCard[] = [
  {
    id: "effects",
    icon: Grid2x2,
    title: "Media Effects",
    helper: "Apply visual effects to your media.",
    cover: "/images/effectbox.png",
    coverClass: "object-center",
  },
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
