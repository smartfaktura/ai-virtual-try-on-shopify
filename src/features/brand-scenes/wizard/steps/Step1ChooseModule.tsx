import { BRAND_SCENE_MODULES, type BrandSceneModule } from "../../constants";

interface Props {
  value: BrandSceneModule;
  onChange: (m: BrandSceneModule) => void;
}

const LABELS: Record<BrandSceneModule, string> = {
  apparel: "Apparel",
  footwear: "Footwear",
  eyewear: "Eyewear",
  bags: "Bags",
  fragrance: "Fragrance",
  activewear: "Activewear",
  accessories: "Accessories",
  beauty: "Beauty",
  home: "Home",
};

export function Step1ChooseModule({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {BRAND_SCENE_MODULES.map((m) => {
        const active = m === value;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={[
              "rounded-2xl border px-4 py-5 text-left transition-all",
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card hover:border-foreground/40",
            ].join(" ")}
          >
            <div className="text-sm font-semibold tracking-tight">
              {LABELS[m]}
            </div>
            <div
              className={[
                "text-[11px] uppercase tracking-[0.16em] mt-1",
                active ? "text-background/60" : "text-muted-foreground",
              ].join(" ")}
            >
              Module
            </div>
          </button>
        );
      })}
    </div>
  );
}
