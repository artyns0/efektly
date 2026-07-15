import { LeftSidebarDemoShell } from "./components/ui-demo/LeftSidebarDemoShell";

/**
 * Efektly's current production shell. The former isolated demo route now uses
 * the same interface as `/`, so existing preview links continue to work.
 */
export default function App() {
  return <LeftSidebarDemoShell />;
}
