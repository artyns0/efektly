import { PlaygroundShell } from "./components/playground/PlaygroundShell";

/**
 * Efektly — the playground shell is the app. (The legacy `?layout=playground`
 * flag is no longer needed; `/` renders the same UI.)
 */
export default function App() {
  return <PlaygroundShell />;
}
