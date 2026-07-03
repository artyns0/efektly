import { AppShell } from "./components/layout/AppShell";
import { PlaygroundShell } from "./components/playground/PlaygroundShell";

/**
 * Layout flag (Phase 3): `?layout=playground` opts into the new
 * motion-design playground shell. Default remains the classic AppShell
 * until the playground reaches feature parity.
 */
const usePlaygroundLayout =
  new URLSearchParams(window.location.search).get("layout") === "playground";

export default function App() {
  return usePlaygroundLayout ? <PlaygroundShell /> : <AppShell />;
}
