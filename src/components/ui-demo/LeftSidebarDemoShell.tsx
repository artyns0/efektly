import {
  Box,
  Boxes,
  Camera,
  ChevronDown,
  Circle,
  Grid2x2,
  HelpCircle,
  Redo2,
  Settings,
  Sparkles,
  Square,
  Undo2,
  Upload,
} from "lucide-react";
import { useEffect } from "react";
import { cn } from "../../lib/cn";
import { useAppStore } from "../../store/useAppStore";
import { useCaptureRecord } from "../../hooks/useCaptureRecord";
import { formatClock } from "../../utils/time";
import { FlapMascot } from "../mascot/FlapMascot";
import { EffectAccordion } from "../playground/EffectAccordion";
import { PlaygroundPanel } from "../playground/PlaygroundPanel";
import { PlaygroundPreview } from "../playground/PlaygroundPreview";
import { PlaygroundRightPanel } from "../playground/PlaygroundRightPanel";
import { PlaygroundStatusBar } from "../playground/PlaygroundStatusBar";
import { ShaderControls } from "../playground/ShaderControls";
import { ThreePanel } from "../panels/ThreePanel";
import { useTimeline } from "../playground/useTimeline";

type NavKey = "source" | "effects" | "shader" | "three";

const NAV = [
  { key: "source" as const, label: "Source", icon: Sparkles },
  { key: "effects" as const, label: "Effects", icon: Grid2x2 },
  { key: "shader" as const, label: "Shader", icon: Box },
  { key: "three" as const, label: "3D", icon: Boxes },
];

function DemoIconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="left-demo-icon-button"
    >
      {children}
    </button>
  );
}

function DemoToolbar() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const setRailSection = useAppStore((s) => s.setRailSection);
  const setExportPanelOpen = useAppStore((s) => s.setExportPanelOpen);
  const setRightTab = useAppStore((s) => s.setRightTab);
  const projectName = useAppStore((s) => s.projectName);
  const setProjectName = useAppStore((s) => s.setProjectName);
  const { canCapture, isRecording, recordElapsedMs, handleCapture, handleRecord } =
    useCaptureRecord({
      onResult: () => {
        setExportPanelOpen(true);
        setRightTab("export");
      },
    });
  const canvasMode = mode === "shader" || mode === "three";

  return (
    <header className="left-demo-toolbar">
      <label className="left-demo-project">
        <input
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          aria-label="Project name"
        />
        <ChevronDown className="size-4" strokeWidth={1.7} />
      </label>

      <div className="ml-auto flex items-center gap-2">
        <DemoIconButton label="Undo" disabled>
          <Undo2 className="size-4" strokeWidth={1.8} />
        </DemoIconButton>
        <DemoIconButton label="Redo" disabled>
          <Redo2 className="size-4" strokeWidth={1.8} />
        </DemoIconButton>
        <DemoIconButton
          label="Settings"
          onClick={() => {
            setMode("media");
            setRailSection("settings");
          }}
        >
          <Settings className="size-4" strokeWidth={1.8} />
        </DemoIconButton>
        <DemoIconButton label="Help">
          <HelpCircle className="size-4" strokeWidth={1.8} />
        </DemoIconButton>
        <DemoIconButton
          label="Capture"
          onClick={handleCapture}
          disabled={!canCapture || isRecording}
        >
          <Camera className="size-4" strokeWidth={1.8} />
        </DemoIconButton>
        <button
          type="button"
          aria-label={isRecording ? "Stop recording" : "Record"}
          aria-pressed={isRecording}
          onClick={handleRecord}
          disabled={!canCapture || (!canvasMode && !isRecording)}
          className={cn("left-demo-record", isRecording && "left-demo-record--active")}
        >
          {isRecording ? (
            <>
              <Square className="size-3 fill-flame text-flame" />
              {formatClock(recordElapsedMs)}
            </>
          ) : (
            <Circle className="size-3.5 fill-current" />
          )}
        </button>
        <button
          type="button"
          className="left-demo-export"
          onClick={() => {
            setExportPanelOpen(true);
            setRightTab("export");
          }}
        >
          <Upload className="size-4" strokeWidth={1.8} />
          <span>Export</span>
          <span className="h-5 w-px bg-white/10" />
          <ChevronDown className="size-3.5" />
        </button>
      </div>
    </header>
  );
}

function DemoSidebar() {
  const mode = useAppStore((s) => s.mode);
  const railSection = useAppStore((s) => s.railSection);
  const setMode = useAppStore((s) => s.setMode);
  const setRailSection = useAppStore((s) => s.setRailSection);
  const setRightTab = useAppStore((s) => s.setRightTab);

  const active: NavKey | null =
    mode === "shader"
      ? "shader"
      : mode === "three"
        ? "three"
        : railSection === "source"
          ? "source"
          : railSection === "effects"
            ? "effects"
            : null;

  const navigate = (key: NavKey) => {
    if (key === "shader") {
      setMode("shader");
      setRightTab("properties");
    } else if (key === "three") {
      setMode("three");
      setRightTab("properties");
    } else {
      setMode("media");
      setRailSection(key);
      if (key === "effects") setRightTab("properties");
    }
  };

  const contextPanel =
    mode === "shader" ? (
      <div onClickCapture={() => setRightTab("properties")}>
        <ShaderControls variant="selector" />
      </div>
    ) : mode === "three" ? (
      <div onClickCapture={() => setRightTab("properties")}>
        <ThreePanel />
      </div>
    ) : railSection === "effects" ? (
      <EffectAccordion sidebarDemo />
    ) : (
      <PlaygroundPanel />
    );

  return (
    <aside className="left-demo-sidebar">
      <div className="left-demo-brand">
        <a href="https://efektly.com/" aria-label="Efektly home">
          <img src="/efektly_logo_beyaz.png" alt="Efektly" draggable={false} />
        </a>
        <span>Beta</span>
        <p>Upload. Style. Export.</p>
      </div>

      <FlapMascot />

      <nav className="left-demo-nav" aria-label="Workspace">
        {NAV.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            aria-current={active === key ? "page" : undefined}
            onClick={() => navigate(key)}
            className={cn("left-demo-nav-item", active === key && "is-active")}
          >
            <Icon className="size-[18px]" strokeWidth={1.7} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <section
        className={cn(
          "left-demo-context-card",
          railSection !== "effects" || mode !== "media"
            ? "scroll-thin overflow-y-auto pr-2"
            : "",
        )}
      >
        {contextPanel}
      </section>

      <div className="left-demo-meta">
        <span><i />GPU Accelerated</span>
        <span className="font-mono">v0.1.1 <b>Beta</b></span>
        <span>Developed by <a href="https://www.instagram.com/artyns0/">Artyns</a></span>
      </div>
    </aside>
  );
}

export function LeftSidebarDemoShell() {
  const setMode = useAppStore((s) => s.setMode);
  const setRailSection = useAppStore((s) => s.setRailSection);
  useTimeline();

  useEffect(() => {
    setMode("media");
    setRailSection("effects");
  }, [setMode, setRailSection]);

  return (
    <div className="left-demo-shell">
      <div className="left-demo-ambient" aria-hidden />
      <div className="left-demo-layout">
        <DemoSidebar />
        <div className="left-demo-workspace">
          <DemoToolbar />
          <main className="left-demo-main">
            <section className="left-demo-preview-panel">
              <PlaygroundPreview />
            </section>
            <aside className="left-demo-properties-panel">
              <PlaygroundRightPanel shaderPropertiesOnRight />
            </aside>
          </main>
          <PlaygroundStatusBar />
        </div>
      </div>
    </div>
  );
}
