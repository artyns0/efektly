import { useAppStore } from "../../store/useAppStore";
import { Section } from "../controls/Section";
import { SegmentedControl } from "../controls/SegmentedControl";
import { SelectControl } from "../controls/SelectControl";
import { Toggle } from "../controls/Toggle";

export function SettingsPanel() {
  const {
    theme,
    setTheme,
    gridVisible,
    setGridVisible,
    previewQuality,
    setPreviewQuality,
    format,
    rememberExport,
    setRememberExport,
    hardwareAccel,
    setHardwareAccel,
  } = useAppStore();

  return (
    <div className="flex flex-col gap-3.5">
      <Section title="Theme">
        <SegmentedControl
          value={theme}
          onChange={setTheme}
          segments={[
            { value: "onyx", label: "Onyx" },
            { value: "system", label: "System" },
          ]}
        />
      </Section>

      <Section title="Workspace">
        <div className="flex flex-col gap-4">
          <Toggle
            label="Grid background"
            description="Show the grid behind the preview."
            checked={gridVisible}
            onChange={setGridVisible}
          />
          <Toggle
            label="Hardware acceleration"
            description="Use the GPU for rendering when available."
            checked={hardwareAccel}
            onChange={setHardwareAccel}
          />
        </div>
      </Section>

      <Section title="Preview Quality">
        <SelectControl
          value={previewQuality}
          onChange={(v) => setPreviewQuality(v as typeof previewQuality)}
          options={[
            { value: "draft", label: "Draft — fastest" },
            { value: "balanced", label: "Balanced" },
            { value: "high", label: "High — crisp" },
          ]}
        />
      </Section>

      <Section title="Default Export">
        <SelectControl
          label="Format"
          value={format}
          onChange={() => {}}
          options={[
            { value: "png", label: "PNG" },
            { value: "jpg", label: "JPEG" },
          ]}
        />
        <div className="mt-4">
          <Toggle
            label="Remember last export settings"
            checked={rememberExport}
            onChange={setRememberExport}
          />
        </div>
      </Section>

      <Section title="About">
        <div className="flex flex-col gap-1 text-sm text-linen/55">
          <div className="flex justify-between">
            <span>Version</span>
            <span className="font-mono text-xs text-linen/70">0.1.0</span>
          </div>
          <div className="flex justify-between">
            <span>Storage</span>
            <span className="text-xs text-linen/70">Local-first · on device</span>
          </div>
        </div>
      </Section>
    </div>
  );
}
