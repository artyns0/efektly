import { MoreHorizontal } from "lucide-react";
import { Section } from "../controls/Section";
import { MediaSource } from "../media/MediaSource";
import { InputModeToggle } from "./InputModeToggle";
import { EffectStack } from "./EffectStack";
import { EffectSettings } from "./EffectSettings";

export function MediaPanel() {
  return (
    <div className="flex flex-col gap-4">
      {/* 1 — Input Source */}
      <Section index={1} title="Input Source">
        <InputModeToggle />
      </Section>

      {/* 2 — Source */}
      <Section
        index={2}
        title="Source"
        action={
          <button
            aria-label="Source options"
            className="grid size-7 place-items-center rounded-lg text-linen/45 transition-colors hover:bg-linen/[0.06] hover:text-linen"
          >
            <MoreHorizontal className="size-4" />
          </button>
        }
      >
        <MediaSource />
      </Section>

      {/* 3 — Effects */}
      <Section index={3} title="Effects">
        <EffectStack />
      </Section>

      {/* 4 — Settings for the selected effect */}
      <EffectSettings />
    </div>
  );
}
