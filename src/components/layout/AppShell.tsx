import { TopBar } from "./TopBar";
import { SideNav } from "./SideNav";
import { ControlPanel } from "./ControlPanel";
import { PreviewWorkspace } from "./PreviewWorkspace";

export function AppShell() {
  return (
    // Desktop-first: below the minimum width the app scrolls horizontally
    // rather than compressing the layout.
    <div className="h-screen w-screen overflow-x-auto overflow-y-hidden bg-onyx text-linen">
      <div className="flex h-full min-w-[1280px] flex-col">
        <TopBar />
        <div className="flex min-h-0 flex-1">
          <SideNav />
          <ControlPanel />
          <PreviewWorkspace />
        </div>
      </div>
    </div>
  );
}
