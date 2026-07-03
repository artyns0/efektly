import { Image as ImageIcon, Sparkles } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { SegmentedControl } from "../controls/SegmentedControl";

/* ------------------------------------------------------------------ */
/*  Media / Shader input toggle. Switches the app mode (and mirrors    */
/*  inputSource) so it works from both the Media and Shader panels.    */
/* ------------------------------------------------------------------ */

export function InputModeToggle() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const setInputSource = useAppStore((s) => s.setInputSource);

  const value = mode === "shader" ? "shader" : "media";

  return (
    <SegmentedControl
      value={value}
      onChange={(v) => {
        setInputSource(v);
        setMode(v === "shader" ? "shader" : "media");
      }}
      segments={[
        {
          value: "media",
          label: "Media",
          icon: <ImageIcon className="size-4" strokeWidth={1.9} />,
        },
        {
          value: "shader",
          label: "Shader",
          icon: <Sparkles className="size-4" strokeWidth={1.9} />,
        },
      ]}
    />
  );
}
