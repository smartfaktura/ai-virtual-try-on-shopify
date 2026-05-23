import { Sparkles, Camera, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";

const PHASES = [
  { icon: Sparkles, label: "Composing the scene" },
  { icon: Camera, label: "Framing variations" },
  { icon: Wand2, label: "Rendering at high fidelity" },
];

export function BrandSceneGenerateLoading() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPhase((p) => (p + 1) % PHASES.length), 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center animate-in fade-in duration-300">
      <div className="flex justify-center gap-4 mb-5">
        {PHASES.map(({ icon: Icon }, i) => (
          <div
            key={i}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
              i === phase
                ? "bg-foreground text-background scale-110"
                : "bg-muted text-muted-foreground scale-100"
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
        ))}
      </div>
      <div className="text-sm font-medium tracking-tight">{PHASES[phase].label}</div>
      <div className="text-[11px] text-muted-foreground mt-1.5">
        Generating 3 variations — about 30 seconds
      </div>
    </div>
  );
}
