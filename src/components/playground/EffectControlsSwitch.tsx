import type { EffectInstance } from "../../types/effects";
import { DitherControls } from "../panels/effects/DitherControls";
import { AsciiControls } from "../panels/effects/AsciiControls";
import { GlitchControls } from "../panels/effects/GlitchControls";
import { LineArtControls } from "../panels/effects/LineArtControls";
import { GrainControls } from "../panels/effects/GrainControls";
import { ReflectionGridControls } from "../panels/effects/ReflectionGridControls";
import { VerticalEchoControls } from "../panels/effects/VerticalEchoControls";
import { GenericEffectControls } from "../panels/effects/GenericEffectControls";

/** Routes an effect instance to its control component (bespoke or schema). */
export function EffectControlsSwitch({ effect }: { effect: EffectInstance }) {
  switch (effect.type) {
    case "dither":
      return <DitherControls effect={effect} />;
    case "ascii":
      return <AsciiControls effect={effect} />;
    case "glitch":
      return <GlitchControls effect={effect} />;
    case "lineArt":
      return <LineArtControls effect={effect} />;
    case "grain":
      return <GrainControls effect={effect} />;
    case "reflectionGrid":
      return <ReflectionGridControls effect={effect} />;
    case "verticalEcho":
      return <VerticalEchoControls effect={effect} />;
    default:
      return <GenericEffectControls effect={effect} />;
  }
}
