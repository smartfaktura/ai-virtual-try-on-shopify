import {
  BRAND_SCENE_MODULES,
  BRAND_SCENE_MODULE_LABELS,
  BRAND_SCENE_UNLOCKED_MODULES,
  type BrandSceneModule,
} from "../../constants";
import { WizardCard } from "../components/WizardCard";

interface Props {
  value: BrandSceneModule | undefined;
  onChange: (m: BrandSceneModule) => void;
}

export function Step1ChooseModule({ value, onChange }: Props) {
  const selected = value;
  const selectedNeedsFallback =
    selected && !BRAND_SCENE_UNLOCKED_MODULES.includes(selected);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {BRAND_SCENE_MODULES.map((m) => (
          <WizardCard
            key={m}
            active={m === selected}
            onClick={() => onChange(m)}
            title={BRAND_SCENE_MODULE_LABELS[m]}
          />
        ))}
      </div>
      {selectedNeedsFallback && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          More tailored questions for{" "}
          <span className="text-foreground font-medium">
            {BRAND_SCENE_MODULE_LABELS[selected!]}
          </span>{" "}
          ship soon — you can still build this scene from the base details.
        </p>
      )}
    </div>
  );
}
