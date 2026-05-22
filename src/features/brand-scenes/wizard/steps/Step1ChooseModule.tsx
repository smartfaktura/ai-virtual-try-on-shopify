import { Lock } from "lucide-react";
import {
  BRAND_SCENE_MODULES,
  BRAND_SCENE_MODULE_LABELS,
  BRAND_SCENE_UNLOCKED_MODULES,
  type BrandSceneModule,
} from "../../constants";
import { WizardCard } from "../components/WizardCard";

interface Props {
  value: BrandSceneModule;
  onChange: (m: BrandSceneModule) => void;
}

const FAMILY_BLURBS: Record<BrandSceneModule, string> = {
  fashion: "Apparel on models or flat-lay",
  footwear: "Sneakers, heels, boots",
  "bags-accessories": "Handbags, belts, small leather",
  "hats-caps-beanies": "Headwear on or off model",
  watches: "Wrist shots, top-down detail",
  eyewear: "On-face and product still-life",
  jewelry: "Macro and worn jewelry",
  "beauty-fragrance": "Bottles, jars, atmospheric still-life",
  home: "Decor, kitchenware, soft goods",
  tech: "Devices, gadgets, accessories",
  "food-drink": "Plates, bottles, lifestyle table",
  wellness: "Supplements, skincare, ritual",
};

export function Step1ChooseModule({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {BRAND_SCENE_MODULES.map((m) => {
        const active = m === value;
        const unlocked = BRAND_SCENE_UNLOCKED_MODULES.includes(m);
        return (
          <WizardCard
            key={m}
            active={active}
            disabled={!unlocked}
            onClick={() => unlocked && onChange(m)}
            title={BRAND_SCENE_MODULE_LABELS[m]}
            body={FAMILY_BLURBS[m]}
            tag={unlocked ? "Available" : "Coming soon"}
            icon={!unlocked ? <Lock className="w-4 h-4" /> : undefined}
          />
        );
      })}
    </div>
  );
}
