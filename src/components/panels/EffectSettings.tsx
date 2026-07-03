import { useAppStore } from "../../store/useAppStore";
import { Section } from "../controls/Section";
import { DitherControls } from "./effects/DitherControls";
import { AsciiControls } from "./effects/AsciiControls";
import { GlitchControls } from "./effects/GlitchControls";
import { LineArtControls } from "./effects/LineArtControls";
import { GrainControls } from "./effects/GrainControls";
import { ReflectionGridControls } from "./effects/ReflectionGridControls";
import { VerticalEchoControls } from "./effects/VerticalEchoControls";

/**
 * Settings for the currently selected effect. Renders the matching control
 * set; every change writes straight to that effect's settings in the store.
 * Controls are live even though nothing processes the canvas yet.
 */
export function EffectSettings() {
  const effects = useAppStore((s) => s.effects);
  const selectedEffectId = useAppStore((s) => s.selectedEffectId);

  const effect = effects.find((fx) => fx.id === selectedEffectId);
  if (!effect) return null;

  return (
    <Section title={`${effect.name} Settings`}>
      <p className="mb-4 text-[11px] text-linen/35">Controls ready · preview coming next</p>

      {effect.type === "dither" && <DitherControls effect={effect} />}
      {effect.type === "ascii" && <AsciiControls effect={effect} />}
      {effect.type === "glitch" && <GlitchControls effect={effect} />}
      {effect.type === "lineArt" && <LineArtControls effect={effect} />}
      {effect.type === "grain" && <GrainControls effect={effect} />}
      {effect.type === "reflectionGrid" && (
        <ReflectionGridControls effect={effect} />
      )}
      {effect.type === "verticalEcho" && (
        <VerticalEchoControls effect={effect} />
      )}
    </Section>
  );
}
