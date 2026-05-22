import { Lock } from "lucide-react";
import {
  BRAND_SCENE_MODULES,
  BRAND_SCENE_MODULE_LABELS,
  BRAND_SCENE_UNLOCKED_MODULES,
  type BrandSceneModule,
} from "../../constants";

interface Props {
  value: BrandSceneModule;
  onChange: (m: BrandSceneModule) => void;
}

export function Step1ChooseModule({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {BRAND_SCENE_MODULES.map((m) => {
        const active = m === value;
        const unlocked = BRAND_SCENE_UNLOCKED_MODULES.includes(m);
        return (
          <button
            key={m}
            type="button"
            disabled={!unlocked}
            onClick={() => unlocked && onChange(m)}
            className={[
              "relative rounded-2xl border px-4 py-5 text-left transition-all",
              !unlocked
                ? "border-border bg-muted/30 text-muted-foreground cursor-not-allowed"
                : active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card hover:border-foreground/40",
            ].join(" ")}
          >
            <div className="text-sm font-semibold tracking-tight">
              {BRAND_SCENE_MODULE_LABELS[m]}
            </div>
            <div
              className={[
                "text-[11px] uppercase tracking-[0.16em] mt-1 flex items-center gap-1.5",
                !unlocked
                  ? "text-muted-foreground"
                  : active
                    ? "text-background/60"
                    : "text-muted-foreground",
              ].join(" ")}
            >
              {!unlocked && <Lock className="w-3 h-3" />}
              {unlocked ? "Available" : "Coming soon"}
            </div>
          </button>
        );
      })}
    </div>
  );
}
