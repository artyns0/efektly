import { Component, type ReactNode } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Error boundary for the Live Preview region.                        */
/*  A crash inside the preview (canvas components, renderers invoked   */
/*  during render/effects, HMR hiccups) shows a small fallback card     */
/*  instead of unmounting the whole app. "Reload preview" remounts     */
/*  just the preview subtree via a key bump.                           */
/* ------------------------------------------------------------------ */

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  resetKey: number;
}

export class PreviewErrorBoundary extends Component<Props, State> {
  state: State = { error: null, resetKey: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error): void {
    // Keep a console trace for debugging; the app itself stays alive.
    console.error("[Efektly] Preview crashed:", error);
  }

  private reset = () => {
    this.setState((s) => ({ error: null, resetKey: s.resetKey + 1 }));
  };

  render() {
    if (this.state.error) {
      return (
        <div className="grid size-full place-items-center bg-onyx-50">
          <div className="flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-white/[0.07] bg-linen/[0.03] px-8 py-7 text-center backdrop-blur-xl">
            <span className="grid size-10 place-items-center rounded-xl bg-flame/15 text-flame">
              <TriangleAlert className="size-5" strokeWidth={1.9} />
            </span>
            <div>
              <p className="text-sm font-medium text-linen">
                Preview hit an error
              </p>
              <p className="mt-1 text-xs text-linen/45">
                The rest of the app is unaffected. Reload the preview to
                continue.
              </p>
            </div>
            <button
              type="button"
              onClick={this.reset}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-flame/60 bg-flame px-3.5 text-sm font-semibold text-onyx transition-colors hover:bg-flame-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/60"
            >
              <RefreshCw className="size-4" strokeWidth={2} />
              Reload preview
            </button>
          </div>
        </div>
      );
    }

    // key bump forces a clean remount of the preview subtree after reset
    return <div key={this.state.resetKey} className="contents">{this.props.children}</div>;
  }
}
