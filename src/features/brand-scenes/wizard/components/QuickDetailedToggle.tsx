import { useEffect, useState, useCallback } from "react";

export type WizardMode = "quick" | "detailed";

const STORAGE_KEY = "brand-scene-wizard:mode";

function readStored(): WizardMode {
  if (typeof window === "undefined") return "quick";
  try {
    const v = window.sessionStorage.getItem(STORAGE_KEY);
    return v === "detailed" ? "detailed" : "quick";
  } catch {
    return "quick";
  }
}

/**
 * Phase 7s — Quick vs Detailed quiz mode for the brand-scene wizard.
 * Quick (default) shows only required fields so users can reach Preview in a few taps.
 * Detailed unlocks all optional dials. Persisted per-session.
 */
export function useWizardMode(): {
  mode: WizardMode;
  setMode: (next: WizardMode) => void;
} {
  const [mode, setModeState] = useState<WizardMode>(() => readStored());

  // Keep in sync when other steps flip the toggle.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => setModeState(readStored());
    window.addEventListener("brand-scene-wizard:mode-change", handler);
    return () =>
      window.removeEventListener("brand-scene-wizard:mode-change", handler);
  }, []);

  const setMode = useCallback((next: WizardMode) => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    setModeState(next);
    window.dispatchEvent(new CustomEvent("brand-scene-wizard:mode-change"));
  }, []);

  return { mode, setMode };
}

interface Props {
  helper?: string;
}

export function QuickDetailedToggle({ helper }: Props) {
  const { mode, setMode } = useWizardMode();

  return (
    <div className="space-y-1.5">
      <div
        role="tablist"
        aria-label="Wizard depth"
        className="inline-flex rounded-full border border-border bg-card p-0.5"
      >
        {(["quick", "detailed"] as const).map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(m)}
              className={[
                "px-3.5 py-1 text-[11px] uppercase tracking-[0.18em] rounded-full transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {m === "quick" ? "Quick" : "Detailed"}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground/80">
        {helper ??
          "Quick shows only the essentials — Detailed unlocks every dial"}
      </p>
    </div>
  );
}

/**
 * Inline "+ Customize" link that flips the wizard into detailed mode and
 * (optionally) scrolls the section into view.
 */
export function CustomizeLink({
  label = "+ Customize",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const { mode, setMode } = useWizardMode();
  if (mode === "detailed") return null;
  return (
    <button
      type="button"
      onClick={() => setMode("detailed")}
      className={[
        "text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors",
        className,
      ].join(" ")}
    >
      {label}
    </button>
  );
}
