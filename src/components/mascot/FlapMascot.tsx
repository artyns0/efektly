import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FlapMood } from "../../lib/flapEvents";
import { cn } from "../../lib/cn";
import { FlapCanvas } from "./FlapCanvas";

type Gaze = { x: number; y: number };

const DEMO_MOODS: FlapMood[] = ["wow", "working", "celebrate", "sleepy"];

const MOOD_LABELS: Record<FlapMood, string> = {
  idle: "idle",
  watching: "watching",
  wow: "amazed",
  working: "creating",
  celebrate: "export done",
  sleepy: "sleeping",
  confused: "confused",
};

const LOCK_MS: Partial<Record<FlapMood, number>> = {
  wow: 1700,
  working: 3000,
  celebrate: 2600,
  sleepy: 2800,
  confused: 2200,
};

/**
 * Flap's persistent home in the upper-left workspace panel. The renderer is
 * WebGL-based; the surrounding UI only owns product events and accessibility.
 */
export function FlapMascot() {
  const homeRef = useRef<HTMLElement>(null);
  const moodTimerRef = useRef<number | null>(null);
  const trackingTimerRef = useRef<number | null>(null);
  const sleepTimerRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const lockedUntilRef = useRef(0);
  const demoIndexRef = useRef(0);

  const [mood, setMood] = useState<FlapMood>("idle");
  const [gaze, setGaze] = useState<Gaze>({ x: 0, y: 0 });
  const [collapsed, setCollapsed] = useState(false);

  const clearTimer = (ref: React.MutableRefObject<number | null>) => {
    if (ref.current !== null) window.clearTimeout(ref.current);
    ref.current = null;
  };

  const returnToIdle = useCallback((delay = 0) => {
    clearTimer(moodTimerRef);
    moodTimerRef.current = window.setTimeout(() => {
      lockedUntilRef.current = 0;
      setMood("idle");
    }, delay);
  }, []);

  const react = useCallback(
    (nextMood: FlapMood, duration = LOCK_MS[nextMood] ?? 1700) => {
      clearTimer(moodTimerRef);
      lockedUntilRef.current = Date.now() + duration;
      setMood(nextMood);
      returnToIdle(duration);
    },
    [returnToIdle],
  );

  const resetSleepTimer = useCallback(() => {
    clearTimer(sleepTimerRef);
    sleepTimerRef.current = window.setTimeout(() => {
      if (Date.now() >= lockedUntilRef.current) setMood("sleepy");
    }, 24000);
  }, []);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const home = homeRef.current;
      if (!home || collapsed) return;

      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = window.requestAnimationFrame(() => {
        const rect = home.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height * 0.58);
        const distance = Math.max(1, Math.hypot(dx, dy));
        const strength = Math.min(1, distance / 260);

        setGaze({
          x: (dx / distance) * strength,
          y: (-dy / distance) * strength,
        });

        if (Date.now() >= lockedUntilRef.current) {
          setMood("watching");
          clearTimer(trackingTimerRef);
          trackingTimerRef.current = window.setTimeout(() => setMood("idle"), 1050);
        }
      });

      resetSleepTimer();
    };

    const onControlInput = (event: Event) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement
      ) {
        react("wow", 1200);
      }
      resetSleepTimer();
    };

    const onFlapEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ mood?: FlapMood; duration?: number }>).detail;
      if (detail?.mood) react(detail.mood, detail.duration);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        setMood("sleepy");
      } else {
        setMood("idle");
        resetSleepTimer();
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("input", onControlInput, { passive: true });
    window.addEventListener("efektly:flap", onFlapEvent);
    document.addEventListener("visibilitychange", onVisibilityChange);
    resetSleepTimer();

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("input", onControlInput);
      window.removeEventListener("efektly:flap", onFlapEvent);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearTimer(moodTimerRef);
      clearTimer(trackingTimerRef);
      clearTimer(sleepTimerRef);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [collapsed, react, resetSleepTimer]);

  const playNextDemoMood = () => {
    const nextMood = DEMO_MOODS[demoIndexRef.current % DEMO_MOODS.length];
    demoIndexRef.current += 1;
    react(nextMood);
    resetSleepTimer();
  };

  return (
    <section
      ref={homeRef}
      data-mood={mood}
      className={cn("flap-home", collapsed && "flap-home--collapsed")}
      aria-label={`Flap mascot home. Current state: ${MOOD_LABELS[mood]}.`}
    >
      <header className="flap-home__header">
        <div className="flap-home__identity">
          <span className="flap-home__live" aria-hidden="true" />
          <span className="flap-home__name">Flap</span>
        </div>

        <div className="flap-home__actions">
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="flap-home__icon-button"
            aria-label={collapsed ? "Expand Flap home" : "Collapse Flap home"}
            aria-expanded={!collapsed}
          >
            <ChevronDown
              className={cn("size-3.5 transition-transform", collapsed && "-rotate-90")}
            />
          </button>
        </div>
      </header>

      <button
        type="button"
        onClick={playNextDemoMood}
        className="flap-home__stage"
        aria-label={`Flap is ${MOOD_LABELS[mood]}. Click to preview the next reaction.`}
        tabIndex={collapsed ? -1 : 0}
      >
        <FlapCanvas mood={mood} gaze={gaze} quiet={false} />
        <span className="flap-home__hint">click to preview reactions</span>
      </button>
    </section>
  );
}
